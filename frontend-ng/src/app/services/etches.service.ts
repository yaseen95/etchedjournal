import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Base64Str } from '../models/encrypted-entity';
import { EtchEntity } from '../models/etch-entity';
import { EncryptedEntityRequest, ENTRY_ID, ETCHES_URL } from './etched-api.service';

@Injectable({
    providedIn: 'root'
})
export class EtchesService {

    constructor(private http: HttpClient) {
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

    public getEtches(entryId: string): Observable<EtchEntity[]> {
        const params = new HttpParams().set(ENTRY_ID, entryId);
        const options = {params: params};
        console.info(`Getting etches for entry ${entryId}`);
        return this.http.get<EtchEntity[]>(ETCHES_URL, options)
            .pipe(tap(etches => {
                console.info(`Fetched ${etches.length} etches for entry ${entryId}`);
            }));
    }

    private post<Request, Response>(url: string, body: Request, params?: HttpParams):
        Observable<Response> {
        return this.http.post<Response>(url, body, {params: params});
    }
}
