import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { EtchStore } from '../stores/etch.store';
import { FakeEtchStore } from '../stores/etch.store.spec';
import { EtchQueueService } from './etch-queue.service';

describe('EtchQueueService', () => {
    let service: EtchQueueService;
    let etchStore: FakeEtchStore;

    beforeEach(() => {
        etchStore = new FakeEtchStore();

        TestBed.configureTestingModule({
            providers: [
                {provide: EtchStore, useValue: etchStore},
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
        service.put('entryId', {schemaVersion: 'abc'});
        expect(service.queuedEtches.size).toEqual(1);

        const createEtchesSpy = spyOn(etchStore, 'createEtches');
        service.postQueuedEtches();
        tick();

        expect(service.queuedEtches.size).toEqual(0);
        expect(createEtchesSpy).toHaveBeenCalledTimes(1);
        expect(createEtchesSpy).toHaveBeenCalledWith('entryId', [{schemaVersion: 'abc'}]);
    }));

    it('posts multiple etches for single entry', fakeAsync(() => {
        service.put('entryId', {schemaVersion: 'abc'});
        service.put('entryId', {schemaVersion: 'def'});
        expect(service.queuedEtches.size).toEqual(1);

        const createEtchesSpy = spyOn(etchStore, 'createEtches');
        service.postQueuedEtches();
        tick();

        expect(service.queuedEtches.size).toEqual(0);

        expect(createEtchesSpy).toHaveBeenCalledTimes(1);
        expect(createEtchesSpy).toHaveBeenCalledWith(
            'entryId',
            [{schemaVersion: 'abc'}, {schemaVersion: 'def'}]
        );
    }));

    it('posts etches for multiple entries', fakeAsync(() => {
        service.put('entry1', {schemaVersion: 'abc'});
        service.put('entry2', {schemaVersion: 'def'});
        expect(service.queuedEtches.size).toEqual(2);

        const createEtchesSpy = spyOn(etchStore, 'createEtches');
        service.postQueuedEtches();
        tick();

        expect(service.queuedEtches.size).toEqual(0);

        expect(createEtchesSpy).toHaveBeenCalledTimes(2);
        expect(createEtchesSpy.calls.allArgs())
            .toEqual([['entry1', [{schemaVersion: 'abc'}]], ['entry2', [{schemaVersion: 'def'}]]]);
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
        const createEtchesSpy = spyOn(etchStore, 'createEtches');

        service.postQueuedEtches();

        expect(createEtchesSpy).toHaveBeenCalledTimes(0);
    });
});
