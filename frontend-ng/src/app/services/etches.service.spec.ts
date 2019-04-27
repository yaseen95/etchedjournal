import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { TestUtils } from '../utils/test-utils.spec';
import { EncryptedEntityRequest } from './etched-api-utils';

import { CreateEtchesRequest, EtchesService } from './etches.service';
import { EtchEntity } from './models/etch-entity';
import { Schema } from './models/schema';
import createEtchEntity = TestUtils.createEtchEntity;

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
        const creatingEtches: EncryptedEntityRequest[] = [
            { content: 'etch1', keyPairId: 'kpId', schema: Schema.V1_0 },
            { content: 'etch2', keyPairId: 'kpId', schema: Schema.V1_0 },
        ];
        const createEtchesReq: CreateEtchesRequest = { entryId: 'entryId', etches: creatingEtches };
        service.postEtches(createEtchesReq).subscribe((result: EtchEntity[]) => {
            expect(result.length).toEqual(2);
            expect(result[0].content).toEqual('etch1');
            expect(result[1].content).toEqual('etch2');
        });

        const etches: EtchEntity[] = [
            createEtchEntity({ content: 'etch1' }),
            createEtchEntity({ content: 'etch2' }),
        ];

        const req = httpMock.expectOne(`${environment.API_URL}/etches?entryId=entryId`);
        expect(req.request.method).toEqual('POST');
        req.flush(etches);
    });

    it('get etches', () => {
        service.getEtches('entry1').subscribe(etches => {
            expect(etches.length).toEqual(2);
            expect(etches[0].content).toEqual('etch1');
            expect(etches[0].entryId).toEqual('entry1');
            expect(etches[1].content).toEqual('etch2');
            expect(etches[1].entryId).toEqual('entry1');
        });

        const entries: EtchEntity[] = [
            createEtchEntity({ content: 'etch1', entryId: 'entry1' }),
            createEtchEntity({ content: 'etch2', entryId: 'entry1' }),
        ];

        const req = httpMock.expectOne(`${environment.API_URL}/etches?entryId=entry1`);
        expect(req.request.method).toEqual('GET');
        req.flush(entries);
    });
});
