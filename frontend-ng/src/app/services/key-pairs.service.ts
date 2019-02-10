import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { KeyPairEntity } from '../models/key-pair-entity';
import { CreateKeyPairRequest } from './dtos/create-key-pair-request';
import { KEYPAIRS_URL } from './etched-api-utils';

@Injectable({
    providedIn: 'root',
})
export class KeyPairsService {
    constructor(private http: HttpClient) {}

    public createKeyPair(req: CreateKeyPairRequest): Observable<KeyPairEntity> {
        console.info('Creating keypair');
        return this.http
            .post<KeyPairEntity>(KEYPAIRS_URL, req)
            .pipe(tap(keypair => console.info(`Created ${JSON.stringify(keypair)}`)));
    }

    public getKeyPairs(): Observable<KeyPairEntity[]> {
        console.info('Getting key pairs');
        return this.http
            .get<KeyPairEntity[]>(KEYPAIRS_URL)
            .pipe(tap(keyPairs => console.info('Successfully retrieved key pairs')));
    }
}
