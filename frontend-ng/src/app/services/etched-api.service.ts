import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { TokenResponse } from './dtos/token-response';
import { map, switchMap, tap } from 'rxjs/operators';
import { EtchedUser } from '../models/etched-user';
import { Base64Str } from '../models/encrypted-entity';
import { EntryEntity } from '../models/entry-entity';
import { EtchEntity } from '../models/etch-entity';
import { KeyPairEntity } from '../models/key-pair-entity';
import { JournalEntity } from '../models/journal-entity';
import { CreateKeyPairRequest } from './dtos/create-key-pair-request';
import { RefreshToken, TokenDecoder } from '../utils/token-decoder';

export const LOGIN_URL = `${environment.API_URL}/auth/authenticate`;
export const REGISTER_URL = `${environment.API_URL}/auth/register`;
export const REFRESH_TOKEN_URL = `${environment.API_URL}/auth/refresh-token`;
export const SELF_URL = `${environment.API_URL}/auth/self`;

export const ENTRIES_URL = `${environment.API_URL}/entries`;
export const ETCHES_URL = `${environment.API_URL}/etches`;
export const JOURNALS_URL = `${environment.API_URL}/journals`;
export const KEYPAIRS_URL = `${environment.API_URL}/keypairs`;

// Used for GET params
export const ENTRY_ID = 'entryId';
export const JOURNAL_ID = 'journalId';

export const LOCAL_ACCESS_TOKEN = 'access_token';
export const LOCAL_REFRESH_TOKEN = 'refresh_token';
export const LOCAL_USER_DETAILS = 'user_details';

/** Routes that require a valid access token */
export const AUTH_REQUIRED_URLS = [
    SELF_URL,
    ENTRIES_URL,
    ETCHES_URL,
    JOURNALS_URL,
    KEYPAIRS_URL,
];

interface EncryptedEntityRequest {
    content: Base64Str,
    keyPairId: string,
}

@Injectable({
    providedIn: 'root'
})
export class EtchedApiService {

    private user: EtchedUser | null;

    constructor(private http: HttpClient) {
        this.user = null;
        this.loadUser();
    }

    /** Loads user from data in localStorage */
    private loadUser() {
        const accessToken = localStorage.getItem(LOCAL_ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(LOCAL_REFRESH_TOKEN);
        const userDetails = localStorage.getItem(LOCAL_USER_DETAILS);

        if (accessToken === null || refreshToken === null || userDetails == null) {
            console.info('No saved tokens/details');
            return;
        }

        const refreshTokenJwt = TokenDecoder.decodeToken<RefreshToken>(refreshToken);
        const refreshExpiry = refreshTokenJwt.exp * 1000;

        if (refreshExpiry - 5_000 < new Date().getTime()) {
            // We only want to set the user if we have a valid refresh token
            console.info('Refresh token has expired');
            return;
        }

        this.user = JSON.parse(userDetails);
    }

    public login(username: string, password: string): Observable<EtchedUser> {
        const requestBody = {username, password};
        return this.http.post(LOGIN_URL, requestBody)
            .pipe(
                map((token: TokenResponse) => this.setTokens(token)),
                switchMap(() => {
                    console.info(`Successfully logged in ${username}`);
                    // Immediately after we've logged in, send a request to get the user details
                    return this.self();
                })
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
        console.info('Getting details about user');
        return this.http.get<EtchedUser>(SELF_URL)
            .pipe(tap((u: EtchedUser) => {
                console.info('Fetched user');
                localStorage.setItem(LOCAL_USER_DETAILS, JSON.stringify(u));
                this.user = u;
            }));
    }

    public getJournals(): Observable<JournalEntity[]> {
        console.info('Getting journals');
        return this.http.get<JournalEntity[]>(JOURNALS_URL)
            .pipe(tap(() => console.info('Fetched journals')));
    }

    public createJournal(keyPairId: string, content: Base64Str): Observable<JournalEntity> {
        console.info('Creating journal');
        const body: EncryptedEntityRequest = {content: content, keyPairId: keyPairId};
        return this.http.post<JournalEntity>(JOURNALS_URL, body)
            .pipe(tap((j) => console.info(`Created journal ${j.id}`)));
    }

    public createEntry(
        keyPairId: string,
        journalId: string,
        content: Base64Str
    ): Observable<EntryEntity> {
        console.info(`Creating an entry for journal ${journalId}`);
        const body: EncryptedEntityRequest = {content: content, keyPairId: keyPairId};
        const params = new HttpParams().set(JOURNAL_ID, journalId);
        const options = {params: params};
        return this.http.post<EntryEntity>(ENTRIES_URL, body, options)
            .pipe(tap(e => console.info(`Created entry ${e.id}`)));
    }

    public getEntries(journalId: string): Observable<EntryEntity[]> {
        console.info(`Getting entries for ${journalId}`);
        const params = new HttpParams().set(JOURNAL_ID, journalId);
        const options = {params: params};
        return this.http.get<EntryEntity[]>(ENTRIES_URL, options)
            .pipe(tap(entries => console.info(`Fetched ${entries.length} entries`)));
    }

    public postEtches(
        keyPairId: string,
        entryId: string,
        etches: Base64Str[]
    ): Observable<EtchEntity[]> {
        console.info(`Creating etches for entry ${entryId}`);
        const body: EncryptedEntityRequest[] = etches.map((e) => {
            return {content: e, keyPairId: keyPairId};
        });

        const params = new HttpParams().set(ENTRY_ID, entryId);
        return this.post<EncryptedEntityRequest[], EtchEntity[]>(ETCHES_URL, body, params)
            .pipe(tap(() => console.info(`Created etches for ${entryId}`)));
    }

    public getEntry(entryId: string): Observable<EntryEntity> {
        console.info(`Getting entry ${entryId}`);
        return this.http.get<EntryEntity>(`${ENTRIES_URL}/${entryId}`)
            .pipe(tap(() => console.info(`Fetched entry ${entryId}`)));
    }

    public getEtches(entryId: string): Observable<EtchEntity[]> {
        const params = new HttpParams().set(ENTRY_ID, entryId);
        const options = {params: params};
        console.info(`Getting etches for entry ${entryId}`);
        return this.http.get<EtchEntity[]>(ETCHES_URL, options)
            .pipe(tap(etches => {
                console.info(`Fetched ${etches.length} etches for entry ${entryId}`);
            }));
    }

    public createKeyPair(req: CreateKeyPairRequest): Observable<KeyPairEntity> {
        console.info(`Creating keypair`);
        return this.http.post<KeyPairEntity>(KEYPAIRS_URL, req)
            .pipe(tap(keypair => console.info(`Created ${JSON.stringify(keypair)}`)));
    }

    public getKeyPairs(): Observable<KeyPairEntity[]> {
        console.info(`Getting key pairs`);
        return this.http.get<KeyPairEntity[]>(KEYPAIRS_URL)
            .pipe(tap(keyPairs => console.info(`Successfully retrieved key pairs`)));
    }

    private post<Request, Response>(url: string, body: Request, params?: HttpParams): Observable<Response> {
        return this.http.post<Response>(url, body, {params: params});
    }

    private setTokens(response: TokenResponse) {
        localStorage.setItem(LOCAL_ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(LOCAL_REFRESH_TOKEN, response.refreshToken);
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
