import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { EntryEntity } from '../models/entry-entity';
import { EtchEntity } from '../models/etch-entity';
import { OwnerType } from '../models/owner-type';

import { EtchesService } from './etches.service';

describe('EtchesService', () => {
    let injector: TestBed;
    let service: EtchesService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EtchesService],
        });
        injector = getTestBed();
        service = injector.get(EtchesService);
        httpMock = injector.get(HttpTestingController);
    });

    afterEach(() => {
        // Verify that there aren't any outstanding requests
        httpMock.verify();
    });

    it('post etches', () => {
        service
            .postEtches('kpId', 'entryId', ['etch1', 'etch2'])
            .subscribe((result: EtchEntity[]) => {
                expect(result.length).toEqual(2);
                expect(result[0].content).toEqual('etch1');
                expect(result[1].content).toEqual('etch2');
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
            entryId: 'entryId',
            version: 1,
            schema: '1.0.0',
        };
        etches[1] = {
            content: 'etch2',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 2,
            id: '2',
            keyPairId: 'kpId',
            entryId: 'entryId',
            version: 1,
            schema: '1.0.0',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/etches?entryId=entryId`);
        expect(req.request.method).toEqual('POST');
        req.flush(etches);
    });

    it('get etches', () => {
        service.getEtches('entry1').subscribe(etches => {
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
            journalId: 'jid',
            version: 1,
            schema: '1.0.0',
        };
        entries[1] = {
            content: 'etch2',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 2,
            id: '2',
            keyPairId: 'kpId',
            journalId: 'jid',
            version: 1,
            schema: '1.0.0',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/etches?entryId=entry1`);
        expect(req.request.method).toEqual('GET');
        req.flush(entries);
    });
});
