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

  export interface ApiError {
    message: string;
  }
}

const AUTHENTICATE_URL = '/auth/authenticate';
// const REGISTER_URL = '/auth/register';
const SELF_URL = '/auth/self';
const CONFIGURE_ENCRYPTION_URL = '/auth/self/configure-encryption';
// const CONFIGURE_ENCRYPTION_URL = '/auth/self/configure-encryption';
const REFRESH_TOKEN_URL = '/auth/refresh-token';

const AUTHORIZATION = 'Authorization';

export enum HttpStatus {
  /* Success codes */
  OK = 200,

  /* Client error codes */
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403
}

function statusOf(status: number): HttpStatus {

  switch (status) {
    // 2xx codes
    case HttpStatus.OK:             return HttpStatus.OK;

    // 4xx codes
    case HttpStatus.BAD_REQUEST:    return HttpStatus.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:   return HttpStatus.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:      return HttpStatus.FORBIDDEN;
    default:
      throw new Error(`Unexpected status code ${status}`);
  }
}

export class HttpError extends Error {
  constructor(readonly status: HttpStatus, readonly message: string, readonly body: string) {
    super(message);
  }
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

  private static parseUser(user: EtchedUser): EtchedUser {
    return new EtchedUser(
      user.id,
      user.username,
      user.email,
      user.admin,
      user.algo,
      user.salt,
      user.keySize,
      user.iterations
    );
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

  /**
   * Utility to throws an ApiError with a good error message
   * @param {Response} response
   * @param {ApiModels.ApiError} json
   */
  private static throwApiError(response: Response, json: ApiModels.ApiError) {
    console.log(`Request to ${response.url} failed. Received status ${response.status}. ` +
      `Response: ${JSON.stringify(json)}`);
    throw new HttpError(statusOf(response.status), json.message, JSON.stringify(json));
  }

  /**
   * Check response for expected status code and return the json if valid otherwise throw an error.
   *
   * @param {Response} response to check
   * @param {HttpStatus} expectedStatus check response for this status, throw error if not matching
   * @returns {Promise<any>} return json body if response is valid
   * @throws {ApiError} if response status does not match expectedStatus
   */
  private static checkResponse(
    response: Response,
    expectedStatus: HttpStatus = HttpStatus.OK
  // tslint:disable-next-line: no-any
  ): Promise<any> {
    if (response.status !== expectedStatus) {
      return response.json().then(json => this.throwApiError(response, json));
    }
    console.log(`Request to ${response.url} was successful`);
    return response.json();
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
      .then(r => EtchedApi.checkResponse(r))
      .then(entries => EtchedApi.parseEntries(entries));
  }

  getEntry(entryId: number): Promise<Entry> {
    console.log(`Getting Entry(id=${entryId})`);
    return fetch(`${this.BASE_URL}/entries/${entryId}`)
      .then(r => EtchedApi.checkResponse(r))
      .then(json => json as Entry);
  }

  getEtches(entryId: number): Promise<Etch[]> {
    console.log(`Getting etches for Entry(id=${entryId})`);
    return fetch(`${this.BASE_URL}/entries/${entryId}/etches`)
      .then(r => EtchedApi.checkResponse(r))
      .then(json => json as Etch[]);
  }

  getEtch(entryId: number, etchId: number): Promise<Etch> {
    return fetch(`${this.BASE_URL}/entries/${entryId}/etches/${etchId}`)
      .then(r => EtchedApi.checkResponse(r))
      .then(json => json as Etch);
  }

  postEtch(entryId: number, etch: Etch): Promise<Etch> {
    let requestInit = EtchedApi.jsonPostInit(etch);

    console.log(`Creating a new etch for Entry(id=${entryId})`);

    return fetch(`${this.BASE_URL}/entries/${entryId}/etches/`, requestInit)
      .then(r => EtchedApi.checkResponse(r))
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
      .then(r => EtchedApi.checkResponse(r))
      .then((user: EtchedUser) => {
        console.log(`Successfully registered EtchedUser(id='${user.id}', username='${username}')`);
        return EtchedApi.parseUser(user);
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
      .then(r => EtchedApi.checkResponse(r))
      .then(tokens => this.setTokens(tokens));
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
      .then((resp: Response) => EtchedApi.checkResponse(resp))
      .then(user => {
        console.log(`Received user info ${JSON.stringify(user)}`);
        return EtchedApi.parseUser(user);
      });
  }

  /**
   * Configure encryption properties for the current user.
   *
   * Requires user to be authenticated.
   *
   * @param {string} algo
   * @param {string} salt
   * @param {number} iterations
   * @param {number} keySize
   * @returns {Promise<EtchedUser>}
   */
  configureEncryption(
    algo: string,
    salt: string,
    iterations: number,
    keySize: number
  ): Promise<EtchedUser> {
    const requestBody = {algo: algo, salt: salt, iterations: iterations, keySize: keySize};
    const requestInit = EtchedApi.jsonPostInit(requestBody);
    (requestInit.headers as Headers).append(AUTHORIZATION, `Bearer ${this.accessToken}`);

    return this.refreshTokens()
      .then(() => fetch(this.BASE_URL + CONFIGURE_ENCRYPTION_URL, requestInit))
      .then(r => EtchedApi.checkResponse(r))
      .then(user => EtchedApi.parseUser(user));
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
      .then(r => EtchedApi.checkResponse(r))
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
