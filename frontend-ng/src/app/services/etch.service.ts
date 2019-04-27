import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EncryptedEntityRequest, ENTRY_ID, ETCHES_URL } from './etched-api-utils';
import { EtchEntity } from './models/etch-entity';

export interface CreateEtchesRequest {
    readonly entryId: string;
    readonly etches: EncryptedEntityRequest[];
}

@Injectable({
    providedIn: 'root',
})
export class EtchService {
    constructor(private http: HttpClient) {}

    public postEtches(req: CreateEtchesRequest): Observable<EtchEntity[]> {
        const params = new HttpParams().set(ENTRY_ID, req.entryId);
        const body = req.etches;
        return this.post<EncryptedEntityRequest[], EtchEntity[]>(ETCHES_URL, body, params).pipe(
            tap(() => console.info(`Created etches for ${req.entryId}`))
        );
    }

    public getEtches(entryId: string): Observable<EtchEntity[]> {
        const params = new HttpParams().set(ENTRY_ID, entryId);
        const options = { params };
        console.info(`Getting etches for entry ${entryId}`);
        return this.http.get<EtchEntity[]>(ETCHES_URL, options).pipe(
            tap(etches => {
                console.info(`Fetched ${etches.length} etches for entry ${entryId}`);
            })
        );
    }

    private post<Request, Response>(
        url: string,
        body: Request,
        params?: HttpParams
    ): Observable<Response> {
        return this.http.post<Response>(url, body, { params });
    }
}
