import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EncryptedEntityRequest, ENTRIES_URL, JOURNAL_ID } from './etched-api-utils';
import { EntryEntity } from './models/entry-entity';

export interface CreateEntryRequest {
    readonly journalId: string;
    readonly entry: EncryptedEntityRequest;
}

@Injectable({
    providedIn: 'root',
})
export class EntriesService {
    constructor(private http: HttpClient) {}

    public createEntry(req: CreateEntryRequest): Observable<EntryEntity> {
        console.info(`Creating an entry for journal ${req.journalId}`);
        const body: EncryptedEntityRequest = req.entry;
        const params = new HttpParams().set(JOURNAL_ID, req.journalId);
        const options = { params };
        return this.http
            .post<EntryEntity>(ENTRIES_URL, body, options)
            .pipe(tap(e => console.info(`Created entry ${e.id}`)));
    }

    public getEntries(journalId: string): Observable<EntryEntity[]> {
        console.info(`Getting entries for ${journalId}`);
        const params = new HttpParams().set(JOURNAL_ID, journalId);
        const options = { params };
        return this.http
            .get<EntryEntity[]>(ENTRIES_URL, options)
            .pipe(tap(entries => console.info(`Fetched ${entries.length} entries`)));
    }

    public getEntry(entryId: string): Observable<EntryEntity> {
        console.info(`Getting entry ${entryId}`);
        return this.http
            .get<EntryEntity>(`${ENTRIES_URL}/${entryId}`)
            .pipe(tap(() => console.info(`Fetched entry ${entryId}`)));
    }
}
