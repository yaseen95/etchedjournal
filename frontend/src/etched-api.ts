import { Entry } from './models/entry';
import { Etch } from './models/etch';
import { EtchedUser } from './models/etched-user';
import { TokenResponse } from './models/token-response';

module ApiModels {

  export interface EntryApiModel {
    id: number;
    etches: Etch[];
    title: string;
    state: string;
    created: string;
    finished: string | null;
  }
}

const AUTHENTICATE_URL = '/auth/authenticate';
// const REGISTER_URL = '/auth/register';
const SELF_URL = '/auth/self';
// const CONFIGURE_ENCRYPTION_URL = '/auth/self/configure-encryption';
const REFRESH_TOKEN_URL = '/auth/refresh-token';

const AUTHORIZATION = 'Authorization';

module HttpStatus {
  // 200
  export const OK: number = 200;

  // 400
  export const BAD_REQUEST: number = 400;
  export const FORBIDDEN: number = 403;
  export const UNAUTHORIZED: number = 401;
}

export class EtchedApi {

  // TODO: Move this to an environment specific config
  BASE_URL = 'http://localhost:8080/api/v1';

  /** used as the Bearer token to authenticate with the backend */
  private accessToken?: string;

  /** used to refresh the tokens with the backend */
  private refreshToken?: string;

  /** expiry of access token (millis since epoch) */
  private accessTokenExpiry?: number;

  /**
   * millis before access token expires to refresh it
   *
   * Every authenticated request, first calls {@link EtchedApi#refreshTokens} to refresh tokens if
   * necessary. That method checks if {current time} > ({token expiry} - {REFRESH_WINDOW}) and
   * refreshes the token.
   *
   * Refreshing of tokens DOES NOT happen in a loop!
   */
  private REFRESH_WINDOW: number = 60 * 1000;

  // Store the access token headers instead of recreating the same thing for every request
  private authHeaders?: Headers;

  /**
   * Parses an object into a legitimate Entry instance
   * @param {ApiModels.EntryApiModel} o object to transform
   * @returns {Entry} an actual Entry instance instantiated with the values from o
   */
  private static parseEntry(o: ApiModels.EntryApiModel): Entry {
    let finished = o.finished ? new Date(o.finished) : undefined;
    return new Entry(o.id, o.title, new Date(o.created), finished, o.etches, o.state);
  }

  /**
   * Parses a list of objects into a list of Entry instances
   * @param {ApiModels.EntryApiModel[]} entryApiModels objects to transform
   * @returns {Entry[]} instantiated Entry instances
   */
  private static parseEntries(entryApiModels: ApiModels.EntryApiModel[]): Entry[] {
    let entries: Entry[] = Array<Entry>(entryApiModels.length);
    for (let i = 0; i < entryApiModels.length; i++) {
      entries.push(EtchedApi.parseEntry(entryApiModels[i]));
    }
    return entries;
  }

  /**
   * Utility for initializing setting required fields for a json POST request
   *
   * @param {object} body the object to send as json
   * @returns {RequestInit} the constructed RequestInit used to send a POST by fetch
   */
  private static jsonPostInit(body: object): RequestInit {
    return {
      method: 'POST',
      headers: new Headers({'Content-Type': 'application/json'}),
      body: JSON.stringify(body)
    };
  }

  private static throwApiError(response: Response, text: string) {
    throw Error(`Request to ${response.url} failed. Received status ${response.status}. Response: ${text}`);
  }

  /**
   * Returns true if this user is logged in.
   */
  isLoggedIn = () => {
    // TODO: Actually validate jwt by checking expiry.
    return this.accessToken !== undefined;
  }

  getEntries(): Promise<Entry[]> {
    console.log('Getting entries');
    return fetch(`${this.BASE_URL}/entries`, {headers: this.authHeaders})
      .then(r => r.json())
      .then(entries => EtchedApi.parseEntries(entries));
  }

  getEntry(entryId: number): Promise<Entry> {
    console.log(`Getting Entry(id=${entryId})`);
    return fetch(`${this.BASE_URL}/entries/${entryId}`)
      .then(r => r.json())
      .then(json => json as Entry);
  }

  getEtches(entryId: number): Promise<Etch[]> {
    console.log(`Getting etches for Entry(id=${entryId})`);
    return fetch(`${this.BASE_URL}/entries/${entryId}/etches`)
      .then(r => r.json())
      .then(json => json as Etch[]);
  }

  getEtch(entryId: number, etchId: number): Promise<Etch> {
    return fetch(`${this.BASE_URL}/entries/${entryId}/etches/${etchId}`)
      .then(r => r.json())
      .then(json => json as Etch);
  }

  postEtch(entryId: number, etch: Etch): Promise<Etch> {
    let requestInit = EtchedApi.jsonPostInit(etch);

    console.log(`Creating a new etch for Entry(id=${entryId})`);

    return fetch(`${this.BASE_URL}/entries/${entryId}/etches/`, requestInit)
      .then(r => r.json())
      .then(savedEtch => savedEtch as Etch);
  }

  /**
   * Registers a user.
   *
   * The auth token is not set after registration. To set auth token call {@link EtchedApi#login}.
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<EtchedUser>}
   */
  register(username: string, email: string, password: string): Promise<EtchedUser> {
    const jsonPayload = {'username': username, 'email': email, 'password': password};
    let requestInit = EtchedApi.jsonPostInit(jsonPayload);

    console.log(`Attempting registration for username: ${username}`);
    return fetch(`${this.BASE_URL}/auth/register`, requestInit)
      .then(r => r.json())
      .then((user: EtchedUser) => {
        console.log(`Successfully registered EtchedUser(id='${user.id}', username='${username}')`);
        return user;
      });
  }

  /**
   * Login and get access tokens which can be used for privileged operations.
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  login(username: string, password: string): Promise<void> {
    let requestInit = EtchedApi.jsonPostInit({'username': username, 'password': password});
    return fetch(this.BASE_URL + AUTHENTICATE_URL, requestInit)
      .then(r => {
        if (r.status !== HttpStatus.OK) {
          console.log(`Login failed for ${username}`);
          return r.text().then(text => EtchedApi.throwApiError(r, text));
        }
        console.log(`Successfully logged in ${username}`);
        return r.json().then(resp => this.setTokens(resp));
      });
  }

  /**
   * Get data about self (currently logged in user).
   *
   * Requires user to be authenticated.
   *
   * @returns {Promise<EtchedUser>}
   */
  self(): Promise<EtchedUser> {
    console.log(`Getting user info`);
    return this.refreshTokens()
      .then(() => fetch(this.BASE_URL + SELF_URL, {headers: this.authHeaders}))
      .then((resp: Response) => {
        console.log(`Received response from ${resp.url}`);
        if (resp.status !== HttpStatus.OK) {
          return resp.text().then(text => EtchedApi.throwApiError(resp, text));
        }
        return resp.json();
      })
      .then(user => {
        console.log(`Received user info ${JSON.stringify(user)}`);
        return user as EtchedUser;
      });
  }

  private refreshTokens(): Promise<void> {
    if (this.accessToken === undefined || this.accessTokenExpiry === undefined) {
      return Promise.reject('Unable to refresh if not logged in');
    }

    if ((new Date().getTime() + this.REFRESH_WINDOW) < this.accessTokenExpiry) {
      // Token hasn't expired and isn't close to expiring
      return Promise.resolve();
    }

    console.log('Refreshing token because it has expired or is about to');

    let requestInit = EtchedApi.jsonPostInit({'refreshToken': this.refreshToken});
    (requestInit.headers as Headers).append(AUTHORIZATION, `Bearer ${this.accessToken}`);

    return fetch(this.BASE_URL + REFRESH_TOKEN_URL, requestInit)
      .then(r => r.json())
      .then((token: TokenResponse) => this.setTokens(token));
  }

  private setTokens(response: TokenResponse) {
    console.log(JSON.stringify(response));
    this.authHeaders = new Headers({AUTHORIZATION: `Bearer ${response.accessToken}`});
    this.accessToken = response.accessToken;
    this.refreshToken = response.refreshToken;
    // TODO: Get expiry from jwt instead of now + seconds
    this.accessTokenExpiry = new Date().getTime() + (1000 * response.expiresIn);
  }
}
