import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CreateKeyPairRequest } from './dtos/create-key-pair-request';
import { KEYPAIRS_URL } from './etched-api-utils';
import { KeyPairEntity } from './models/key-pair-entity';

@Injectable({
    providedIn: 'root',
})
export class KeyPairService {
    constructor(private http: HttpClient) {}

    public createKeyPair(req: CreateKeyPairRequest): Observable<KeyPairEntity> {
        console.info('Creating keyPair');
        return this.http
            .post<KeyPairEntity>(KEYPAIRS_URL, req)
            .pipe(tap(keyPair => console.info(`Created ${JSON.stringify(keyPair)}`)));
    }

    public getKeyPairs(): Observable<KeyPairEntity[]> {
        console.info('Getting key pairs');
        return this.http
            .get<KeyPairEntity[]>(KEYPAIRS_URL)
            .pipe(tap(keyPairs => console.info('Successfully retrieved key pairs')));
    }
}
