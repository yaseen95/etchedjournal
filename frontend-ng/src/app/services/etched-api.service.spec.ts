import { getTestBed, TestBed } from '@angular/core/testing';

import { EtchedApiService } from './etched-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EntryEntity } from '../models/entry-entity';
import { OwnerType } from '../models/owner-type';
import { EtchEntity } from '../models/etch-entity';
import { KeyPairEntity } from '../models/key-pair-entity';
import { JournalEntity } from '../models/journal-entity';
import { CreateKeyPairRequest } from './dtos/create-key-pair-request';

describe('EtchedApiService', () => {
    let injector: TestBed;
    let service: EtchedApiService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EtchedApiService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        injector = getTestBed();
        service = injector.get(EtchedApiService);
        httpMock = injector.get(HttpTestingController);
    });

    it('create entry', () => {
        service.createEntry('kpId', 'journalId', 'content')
            .subscribe(entry => {
                expect(entry.id).toEqual('entryId');
                expect(entry.content).toEqual('base64Content');
                expect(entry.timestamp).toEqual(1);
                expect(entry.owner).toEqual('user');
                expect(entry.ownerType).toEqual(OwnerType.USER);
            });

        const entry: EntryEntity = {
            id: 'entryId',
            content: 'base64Content',
            timestamp: 1,
            owner: 'user',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: 'USER' as OwnerType,
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries?journalId=journalId`);
        expect(req.request.method).toEqual('POST');
        req.flush(entry);
    });

    it('post etches', () => {
        service.postEtches('kpId', 'entryId', ['etch1', 'etch2'])
            .subscribe(etches => {
                expect(etches.length).toEqual(2);
                expect(etches[0].content).toEqual('etch1');
                expect(etches[1].content).toEqual('etch2');
            });

        const etches = new Array<EtchEntity>(2);
        etches[0] = {
            content: 'etch1',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 1,
            id: '1',
            keyPairId: 'kpId',
        };
        etches[1] = {
            content: 'etch2',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 2,
            id: '2',
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/etches?entryId=entryId`);
        expect(req.request.method).toEqual('POST');
        req.flush(etches);
    });

    it('get entries', () => {
        service.getEntries('journalId')
            .subscribe(entries => {
                expect(entries.length).toEqual(2);
                expect(entries[0].content).toEqual('entry1');
                expect(entries[1].content).toEqual('entry2');
            });

        const entries = new Array<EntryEntity>(2);
        entries[0] = {
            content: 'entry1',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 1,
            id: '1',
            keyPairId: 'kpId',
        };
        entries[1] = {
            content: 'entry2',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 2,
            id: '2',
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries?journalId=journalId`);
        expect(req.request.method).toEqual('GET');
        req.flush(entries);
    });

    it('get entry', () => {
        service.getEntry('entry1')
            .subscribe(entry => {
                expect(entry.id).toEqual('entry1');
                expect(entry.timestamp).toEqual(1);
                expect(entry.owner).toEqual('owner');
                expect(entry.keyPairId).toEqual('kpId');
            });

        const entry: EntryEntity = {
            content: 'content',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 1,
            id: 'entry1',
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries/entry1`);
        expect(req.request.method).toEqual('GET');
        req.flush(entry);
    });

    it('get etches', () => {
        service.getEtches('entry1')
            .subscribe(etches => {
                expect(etches.length).toEqual(2);
                expect(etches[0].content).toEqual('etch1');
                expect(etches[1].content).toEqual('etch2');
            });

        const entries = new Array<EntryEntity>(2);
        entries[0] = {
            content: 'etch1',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 1,
            id: '1',
            keyPairId: 'kpId',
        };
        entries[1] = {
            content: 'etch2',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 2,
            id: '2',
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/etches?entryId=entry1`);
        expect(req.request.method).toEqual('GET');
        req.flush(entries);
    });

    it('createKeyPair', () => {
        const req: CreateKeyPairRequest = {
            publicKey: 'pubKey',
            privateKey: 'privKey',
            salt: 'salt',
            iterations: 10,
        };
        service.createKeyPair(req)
            .subscribe(keyPair => {
                expect(keyPair.id).toEqual('id');
                expect(keyPair.owner).toEqual('owner');
                expect(keyPair.ownerType).toEqual('USER');
                expect(keyPair.privateKey).toEqual('privKey');
                expect(keyPair.publicKey).toEqual('pubKey');
                expect(keyPair.timestamp).toEqual(1);
                expect(keyPair.salt).toEqual('salt');
                expect(keyPair.iterations).toEqual(10);
            });

        const mockKeyPair: KeyPairEntity = {
            id: 'id',
            owner: 'owner',
            ownerType: OwnerType.USER,
            privateKey: 'privKey',
            publicKey: 'pubKey',
            timestamp: 1,
            salt: 'salt',
            iterations: 10,
        };

        const mockReq = httpMock.expectOne(`${environment.API_URL}/keypairs`);
        expect(mockReq.request.method).toEqual('POST');
        mockReq.flush(mockKeyPair);
    });

    it('create journal', () => {
        service.createJournal('kpId', 'content')
            .subscribe((journal: JournalEntity) => {
                expect(journal.id).toEqual('entryId');
                expect(journal.content).toEqual('base64Content');
                expect(journal.timestamp).toEqual(1);
                expect(journal.owner).toEqual('user');
                expect(journal.ownerType).toEqual(OwnerType.USER);
                expect(journal.keyPairId).toEqual('kpId');
            });

        const journal: JournalEntity = {
            id: 'entryId',
            content: 'base64Content',
            timestamp: 1,
            owner: 'user',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: 'USER' as OwnerType,
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/journals`);
        expect(req.request.method).toEqual('POST');
        req.flush(journal);
    });

    it('get journals', () => {
        service.getJournals()
            .subscribe((journals: JournalEntity[]) => {
                expect(journals.length).toEqual(1);
                expect(journals[0].id).toEqual('entryId');
                expect(journals[0].content).toEqual('base64Content');
                expect(journals[0].timestamp).toEqual(1);
                expect(journals[0].owner).toEqual('user');
                expect(journals[0].ownerType).toEqual(OwnerType.USER);
                expect(journals[0].keyPairId).toEqual('kpId');
            });

        const journal: JournalEntity = {
            id: 'entryId',
            content: 'base64Content',
            timestamp: 1,
            owner: 'user',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: 'USER' as OwnerType,
            keyPairId: 'kpId',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/journals`);
        expect(req.request.method).toEqual('GET');
        req.flush([journal]);
    });

    afterEach(() => {
        // Verify that there aren't any outstanding requests
        httpMock.verify();
    });
});
