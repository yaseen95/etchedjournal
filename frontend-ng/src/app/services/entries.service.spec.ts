import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { EntryEntity } from '../models/entry-entity';
import { OwnerType } from '../models/owner-type';

import { EntriesService } from './entries.service';

describe('EntriesService', () => {
    let injector: TestBed;
    let service: EntriesService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EntriesService],
        });
        injector = getTestBed();
        service = injector.get(EntriesService);
        httpMock = injector.get(HttpTestingController);
    });

    afterEach(() => {
        // Verify that there aren't any outstanding requests
        httpMock.verify();
    });

    it('create entry', () => {
        service.createEntry('kpId', 'journalId', 'content').subscribe(result => {
            expect(result.id).toEqual('entryId');
            expect(result.content).toEqual('base64Content');
            expect(result.timestamp).toEqual(1);
            expect(result.owner).toEqual('user');
            expect(result.ownerType).toEqual(OwnerType.USER);
        });

        const entry: EntryEntity = {
            id: 'entryId',
            content: 'base64Content',
            timestamp: 1,
            owner: 'user',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: 'USER' as OwnerType,
            keyPairId: 'kpId',
            journalId: 'jid',
            version: 1,
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries?journalId=journalId`);
        expect(req.request.method).toEqual('POST');
        req.flush(entry);
    });

    it('get entries', () => {
        service.getEntries('journalId').subscribe((result: EntryEntity[]) => {
            expect(result.length).toEqual(2);
            expect(result[0].content).toEqual('entry1');
            expect(result[1].content).toEqual('entry2');
        });

        const entries = new Array<EntryEntity>(2);
        entries[0] = {
            content: 'entry1',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 1,
            id: '1',
            keyPairId: 'kpId',
            journalId: 'jid',
            version: 1,
        };
        entries[1] = {
            content: 'entry2',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 2,
            id: '2',
            keyPairId: 'kpId',
            journalId: 'jid',
            version: 1,
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries?journalId=journalId`);
        expect(req.request.method).toEqual('GET');
        req.flush(entries);
    });

    it('get entry', () => {
        service.getEntry('entry1').subscribe(result => {
            expect(result.id).toEqual('entry1');
            expect(result.timestamp).toEqual(1);
            expect(result.owner).toEqual('owner');
            expect(result.keyPairId).toEqual('kpId');
        });

        const entry: EntryEntity = {
            content: 'content',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 1,
            id: 'entry1',
            keyPairId: 'kpId',
            journalId: 'jid',
            version: 1,
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries/entry1`);
        expect(req.request.method).toEqual('GET');
        req.flush(entry);
    });
});
