import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Base64Str } from '../models/encrypted-entity';
import { JournalEntity } from '../models/journal-entity';
import { EncryptedEntityRequest, JOURNALS_URL } from './etched-api-utils';

@Injectable({
    providedIn: 'root',
})
export class JournalsService {
    constructor(private http: HttpClient) {}

    public getJournals(): Observable<JournalEntity[]> {
        console.info('Getting journals');
        return this.http
            .get<JournalEntity[]>(JOURNALS_URL)
            .pipe(tap(() => console.info('Fetched journals')));
    }

    public createJournal(keyPairId: string, content: Base64Str): Observable<JournalEntity> {
        console.info('Creating journal');
        const body: EncryptedEntityRequest = { content, keyPairId };
        return this.http
            .post<JournalEntity>(JOURNALS_URL, body)
            .pipe(tap(j => console.info(`Created journal ${j.id}`)));
    }
}
