import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Base64Str } from '../models/encrypted-entity';
import { KeyPairEntity } from '../models/key-pair-entity';
import { CreateKeyPairRequest } from './dtos/create-key-pair-request';

export const SELF_URL = `${environment.API_URL}/auth/self`;
export const ENTRIES_URL = `${environment.API_URL}/entries`;
export const ETCHES_URL = `${environment.API_URL}/etches`;
export const JOURNALS_URL = `${environment.API_URL}/journals`;
export const KEYPAIRS_URL = `${environment.API_URL}/keypairs`;

// Used for GET params
export const ENTRY_ID = 'entryId';
export const JOURNAL_ID = 'journalId';

/** Routes that require a valid access token */
export const AUTH_REQUIRED_URLS = [
    SELF_URL,
    ENTRIES_URL,
    ETCHES_URL,
    JOURNALS_URL,
    KEYPAIRS_URL,
];

export interface EncryptedEntityRequest {
    content: Base64Str;
    keyPairId: string;
}

@Injectable({
    providedIn: 'root'
})
export class EtchedApiService {

    constructor(private http: HttpClient) {
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
}
