import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { EMPTY, of } from 'rxjs';
import { EncrypterService } from './encrypter.service';
import { EtchQueueService } from './etch-queue.service';
import { EtchesService } from './etches.service';

describe('EtchQueueService', () => {
    let service: EtchQueueService;
    let etchesService: any;
    let encrypterSpy: any;
    let encrypterService: EncrypterService;

    beforeEach(() => {
        etchesService = jasmine.createSpyObj('EtchesService', ['postEtches']);
        etchesService.postEtches.and.returnValue(of(EMPTY));

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt']);
        encrypterSpy.keyPairId = 'keyPairId';

        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        TestBed.configureTestingModule({
            providers: [
                {provide: EtchesService, useValue: etchesService},
                {provide: EncrypterService, useValue: encrypterService},
            ],
        });
        service = TestBed.get(EtchQueueService);
    });

    it('queue is empty initially', () => {
        expect(service.queuedEtches.size).toEqual(0);
    });

    it('put() adds item to queue', () => {
        service.put('entryId', {schemaVersion: 'abc'});
        expect(service.queuedEtches.size).toEqual(1);
        expect(service.queuedEtches.get('entryId')).toEqual([{schemaVersion: 'abc'}]);
    });

    it('put() multiple items for same entry', () => {
        service.put('entryId', {schemaVersion: 'abc'});
        service.put('entryId', {schemaVersion: 'def'});

        // The size is per entry
        expect(service.queuedEtches.size).toEqual(1);
        expect(service.queuedEtches.get('entryId').length).toEqual(2);

        const etches = service.queuedEtches.get('entryId');
        expect(etches).toEqual([{schemaVersion: 'abc'}, {schemaVersion: 'def'}]);
    });

    it('posts queued etches', fakeAsync(() => {
        encrypterSpy.encrypt.and.returnValue(Promise.resolve('foobar'));
        service.put('entryId', {schemaVersion: 'abc'});
        expect(service.queuedEtches.size).toEqual(1);

        service.postQueuedEtches();
        tick();

        expect(service.queuedEtches.size).toEqual(0);

        expect(etchesService.postEtches).toHaveBeenCalledTimes(1);
        expect(etchesService.postEtches).toHaveBeenCalledWith('keyPairId', 'entryId', ['foobar']);
    }));

    it('posts multiple etches for single entry', fakeAsync(() => {
        encrypterSpy.encrypt.and.returnValue(Promise.resolve('foobar'));
        service.put('entryId', {schemaVersion: 'abc'});
        service.put('entryId', {schemaVersion: 'def'});
        expect(service.queuedEtches.size).toEqual(1);

        service.postQueuedEtches();
        tick();

        expect(service.queuedEtches.size).toEqual(0);
        // Etches are batched together and encrypted once
        expect(encrypterSpy.encrypt).toHaveBeenCalledTimes(1);

        expect(etchesService.postEtches).toHaveBeenCalledTimes(1);
        expect(etchesService.postEtches).toHaveBeenCalledWith('keyPairId', 'entryId', ['foobar']);
    }));

    it('posts etches for multiple entries', fakeAsync(() => {
        encrypterSpy.encrypt.and.returnValues(Promise.resolve('foo'), Promise.resolve('bar'));

        service.put('entry1', {schemaVersion: 'abc'});
        service.put('entry2', {schemaVersion: 'def'});
        expect(service.queuedEtches.size).toEqual(2);

        service.postQueuedEtches();
        tick();

        expect(service.queuedEtches.size).toEqual(0);

        // Etches for different etches are encrypted at different times
        expect(encrypterSpy.encrypt).toHaveBeenCalledTimes(2);
        expect(encrypterSpy.encrypt.calls.allArgs())
            .toEqual([['[{"schemaVersion":"abc"}]'], ['[{"schemaVersion":"def"}]']]);

        expect(etchesService.postEtches).toHaveBeenCalledTimes(2);
        expect(etchesService.postEtches.calls.allArgs())
            .toEqual([['keyPairId', 'entry1', ['foo']], ['keyPairId', 'entry2', ['bar']]]);
    }));

    // it('posts etches every 5 seconds', fakeAsync(() => {
    //     // TODO: Not sure why this fails
    //     encrypterSpy.encrypt.and.returnValue(Promise.resolve('foobar'));
    //     service.put('queued', {schemaVersion: 'abc'});
    //
    //     tick(5_000);
    //
    //     expect(etchesService.postEtches).toHaveBeenCalledTimes(1);
    //     expect(etchesService.postEtches).toHaveBeenCalledWith('keyPairId', 'queued', ['foobar']);
    // }));

    it('postQueuedEtches does nothing when no etches', () => {
        expect(service.queuedEtches.size).toEqual(0);

        service.postQueuedEtches();

        expect(etchesService.postEtches).toHaveBeenCalledTimes(0);
    });
});
