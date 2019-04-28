import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EncryptedEntityRequest, JOURNALS_URL } from './etched-api-utils';
import { JournalEntity } from './models/journal-entity';

@Injectable({
    providedIn: 'root',
})
export class JournalService {
    constructor(private http: HttpClient) {}

    public getJournals(): Observable<JournalEntity[]> {
        console.info('Getting journals');
        return this.http
            .get<JournalEntity[]>(JOURNALS_URL)
            .pipe(tap(() => console.info('Fetched journals')));
    }

    public createJournal(req: EncryptedEntityRequest): Observable<JournalEntity> {
        console.info('Creating journal');
        return this.http
            .post<JournalEntity>(JOURNALS_URL, req)
            .pipe(tap(j => console.info(`Created journal ${j.id}`)));
    }
}