import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { TestUtils } from '../utils/test-utils.spec';

import { CreateEntryRequest, EntriesService } from './entries.service';
import { EncryptedEntityRequest } from './etched-api-utils';
import { EntryEntity } from './models/entry-entity';
import { OwnerType } from './models/owner-type';
import { Schema } from './models/schema';
import createEntryEntity = TestUtils.createEntryEntity;

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
        const encEntityReq: EncryptedEntityRequest = {
            content: 'content',
            keyPairId: 'kpId',
            schema: Schema.V1_0,
        };
        const createEntryReq: CreateEntryRequest = { journalId: 'journalId', entry: encEntityReq };
        service.createEntry(createEntryReq).subscribe(result => {
            expect(result.id).toEqual('entryId');
            expect(result.content).toEqual('base64Content');
        });

        const entry: EntryEntity = createEntryEntity({ id: 'entryId', content: 'base64Content' });

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

        const entries: EntryEntity[] = [
            createEntryEntity({ content: 'entry1', id: '1' }),
            createEntryEntity({ content: 'entry2', id: '1' }),
        ];

        const req = httpMock.expectOne(`${environment.API_URL}/entries?journalId=journalId`);
        expect(req.request.method).toEqual('GET');
        req.flush(entries);
    });

    it('get entry', () => {
        service.getEntry('entry1').subscribe(result => {
            expect(result.id).toEqual('entry1');
            expect(result.owner).toEqual('owner');
            expect(result.keyPairId).toEqual('kpId');
        });

        const entry: EntryEntity = createEntryEntity({ id: 'entry1' });

        const req = httpMock.expectOne(`${environment.API_URL}/entries/entry1`);
        expect(req.request.method).toEqual('GET');
        req.flush(entry);
    });
});
