import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { TokenResponse } from './dtos/token-response';
import { map, mergeMap, tap } from 'rxjs/operators';
import { EtchedUser } from '../models/etched-user';
import { Base64Str } from '../models/encrypted-entity';
import { Entry } from '../models/entry';

const LOGIN_URL = `${environment.API_URL}/auth/authenticate`;
const REGISTER_URL = `${environment.API_URL}/auth/register`;
const REFRESH_TOKEN_URL = `${environment.API_URL}/auth/refresh-token`;
const SELF_URL = `${environment.API_URL}/auth/self`;

const ENTRIES_URL = `${environment.API_URL}/entries`;

@Injectable({
    providedIn: 'root'
})
export class EtchedApiService {

    /** used as the Bearer token to authenticate with the backend */
    private accessToken: string;

    /** used to refresh the tokens with the backend */
    private refreshToken: string;

    /** expiry of access token (millis since epoch) */
    private accessTokenExpiry: number;

    /**
     * millis before access token expires to refresh it
     *
     * Every authenticated request, first calls {@link EtchedApiService#refreshTokens} to refresh
     * tokens if necessary. That method checks if
     *  {current time} > ({token expiry} - {REFRESH_WINDOW})
     * and refreshes the token.
     *
     * Refreshing of tokens DOES NOT happen in a loop!
     */
    private REFRESH_WINDOW: number = 60 * 1_000;

    // Store the access token headers instead of recreating the same refreshWrapper for every request
    private authHeaders: HttpHeaders | null;

    private user: EtchedUser | null;

    constructor(private http: HttpClient) {
        this.authHeaders = null;
        this.user = null;
    }

    public login(username: string, password: string): Observable<void> {
        const requestBody = {username, password};
        return this.http.post(LOGIN_URL, requestBody)
            .pipe(
                map((token: TokenResponse) => this.setTokens(token)),
                tap(() => {
                    console.info(`Successfully logged in ${username}`);
                    // Immediately after we've logged in, send a request to get the user details
                    this.self()
                        .subscribe(() => {})
                }),
            );
    }

    public register(
        username: string,
        password: string,
        email: string | null
    ): Observable<EtchedUser> {
        const requestBody = {username, password, email};
        return this.http.post<EtchedUser>(REGISTER_URL, requestBody)
            .pipe(
                tap((user: EtchedUser) => {
                    console.info(`Successfully registered ${JSON.stringify(user)}`);
                })
            );
    }

    /**
     * Get data about self (currently logged in user).
     *
     * Requires user to be authenticated.
     *
     * @returns {Promise<EtchedUser>}
     */
    public self(): Observable<EtchedUser> {
        return this.refreshWrapper(() => {
            console.info('Getting details about user');
            return this.http.get<EtchedUser>(SELF_URL, {headers: this.authHeaders})
                .pipe(tap((u: EtchedUser) => {
                    console.info('Fetched user');
                    this.user = u;
                }));
        });
    }

    public createEntry(content: Base64Str): Observable<Entry> {
        return this.refreshWrapper(() => {
            console.info('Creating an entry');

            return this.http.post<Entry>(ENTRIES_URL, {'content': content}, {headers: this.authHeaders})
                .pipe(tap(e => {
                    console.info(`Created entry ${e.id}`);
                }))
        })
    }

    /**
     * Wrapper that will automatically refresh a token (if necessary) and then invoke the specified
     * function
     * @param fn function to invoke after refreshing the tokens
     */
    private refreshWrapper<T>(fn: () => Observable<T>): Observable<T> {
        return this.refreshTokens()
            .pipe(mergeMap(() => fn.call(null)));
    }

    private refreshTokens(): Observable<boolean> {
        if (this.accessToken === undefined || this.accessTokenExpiry === undefined) {
            throwError('Unable to refresh if not logged in');
        }

        if ((new Date().getTime() + this.REFRESH_WINDOW) < this.accessTokenExpiry) {
            // Token hasn't expired and isn't close to expiring
            console.info('No need to refresh');
            // We have to return something from this so the caller can subscribe to it later
            return of(true);
        }

        console.info('Refreshing token because it has expired or is about to');
        const refreshBody = {'refreshToken': this.refreshToken};

        return this.http.post(REFRESH_TOKEN_URL, refreshBody)
            .pipe(map((token: TokenResponse) => {
                this.setTokens(token);
                return true;
            }));
    }

    private setTokens(response: TokenResponse) {
        console.info(JSON.stringify(response));
        this.authHeaders = new HttpHeaders().set('Authorization', `Bearer ${response.accessToken}`);
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
        // TODO: Get expiry from jwt instead of now + seconds
        this.accessTokenExpiry = new Date().getTime() + (1000 * response.expiresIn);
    }

    /**
     * Get the current user
     *
     * @return the user if they're logged in or null if they're not
     */
    public getUser(): EtchedUser | null {
        return this.user;
    }
}
