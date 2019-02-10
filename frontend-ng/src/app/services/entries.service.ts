import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Base64Str } from '../models/encrypted-entity';
import { EntryEntity } from '../models/entry-entity';
import { EncryptedEntityRequest, ENTRIES_URL, JOURNAL_ID } from './etched-api-utils';

@Injectable({
    providedIn: 'root',
})
export class EntriesService {
    constructor(private http: HttpClient) {}

    public createEntry(
        keyPairId: string,
        journalId: string,
        content: Base64Str
    ): Observable<EntryEntity> {
        console.info(`Creating an entry for journal ${journalId}`);
        const body: EncryptedEntityRequest = { content, keyPairId };
        const params = new HttpParams().set(JOURNAL_ID, journalId);
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
