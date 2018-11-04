import { fakeAsync, tick } from '@angular/core/testing';

import { AbstractEditorContainerComponent } from './abstract-editor-container.component';
import { EtchedApiService } from '../../../services/etched-api.service';
import { OwnerType } from '../../../models/owner-type';
import { Encrypter } from '../../../services/encrypter';
import { of } from 'rxjs';
import { EntryEntity } from '../../../models/entry-entity';
import { EncrypterService } from '../../../services/encrypter.service';

// Test only implementation
class TestEditorContainerComponent extends AbstractEditorContainerComponent {
    constructor(etchedApi: EtchedApiService, encrypterService: EncrypterService) {
        super(etchedApi, encrypterService);
    }
}

describe('AbstractEditorContainerComponent', () => {
    let component: AbstractEditorContainerComponent;
    let etchedApi: any;
    let encrypter: any;
    let encrypterService: any;

    let testEntry: EntryEntity = {
        content: 'entry',
        id: 'entryId',
        ownerType: OwnerType.USER,
        owner: 'owner',
        timestamp: 1,
    };

    beforeEach(() => {
        // Create API and encrypter mocks
        etchedApi = jasmine.createSpyObj('EtchedApiService', ['postEtches']);
        encrypter = jasmine.createSpyObj('Encrypter', ['encrypt']);

        // Create a spy on that static constructor for Encrypter
        const encrypterFromSpy = spyOn(Encrypter, 'from');
        encrypterFromSpy.and.returnValue(Promise.resolve(encrypter));

        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypter;

        etchedApi.postEtches.and.returnValue(of([]));
        component = new TestEditorContainerComponent(etchedApi, encrypterService);
    });

    it('queued should by empty on initialization', () => {
        expect(component.queuedEtches.length).toEqual(0);
    });

    it('postEtches is called every 5 seconds', fakeAsync(() => {
        const postEtchesSpy = spyOn(component, 'postEtches');
        component.ngOnInit();
        tick(5_000);
        expect(postEtchesSpy).toHaveBeenCalledTimes(1);
        tick(5_000);
        expect(postEtchesSpy).toHaveBeenCalledTimes(2);
        component.ngOnDestroy();
    }));

    it('postEtches does nothing when no etches', () => {
        component.queuedEtches = [];
        component.ngOnInit();
        component.entry = testEntry;

        component.postEtches();

        expect(etchedApi.postEtches).toHaveBeenCalledTimes(0);
        expect(encrypter.encrypt).toHaveBeenCalledTimes(0);

        component.ngOnDestroy();
    });

    it('postEtches does nothing when entry is not defined', () => {
        component.queuedEtches.push('etch');
        component.ngOnInit();
        component.entry = undefined;

        component.postEtches();

        expect(etchedApi.postEtches).toHaveBeenCalledTimes(0);
        expect(encrypter.encrypt).toHaveBeenCalledTimes(0);

        component.ngOnDestroy();
    });

    it('postEtches posts and encrypts', fakeAsync(() => {
        component.queuedEtches.push('etch');
        component.entry = testEntry;
        component.encrypter = encrypter;

        encrypter.encrypt.and.returnValue(Promise.resolve('encrypted etch'));
        etchedApi.postEtches.and.returnValue(of(['encrypted etch posted']));

        component.postEtches();

        expect(encrypter.encrypt).toHaveBeenCalledTimes(1);
        expect(encrypter.encrypt).toHaveBeenCalledWith('etch');

        // Etches are posted AFTER they've been encrypted. Encryption occurs in a promise so we
        // have to `tick()` here so that the promises can complete before making the next assertion.
        tick();

        expect(etchedApi.postEtches).toHaveBeenCalledTimes(1);
        expect(etchedApi.postEtches).toHaveBeenCalledWith('entryId', ['encrypted etch']);
        expect(component.queuedEtches).toEqual([]);
    }));

    it('postEtches handles etches being queued', fakeAsync(() => {
        // When postEtches is called, it will take a snapshot of the queue, encrypt and then
        // post them. Meanwhile etches may still continue to be pushed. We need to ensure that
        // the queuing mechanism handles being queued during a request.

        component.queuedEtches.push('etch1', 'etch2');
        component.entry = testEntry;
        component.encrypter = encrypter;

        encrypter.encrypt.and.returnValue(Promise.resolve('e'));
        etchedApi.postEtches.and.returnValue(of(['e', 'e']));

        component.postEtches();

        // Push another item into the queue
        component.queuedEtches.push('etch3');
        expect(component.queuedEtches.length).toEqual(3);

        expect(encrypter.encrypt).toHaveBeenCalledTimes(2);
        expect(encrypter.encrypt.calls.allArgs()).toEqual([['etch1'], ['etch2']]);

        // Etches are posted AFTER they've been encrypted. Encryption occurs in a promise so we
        // have to `tick()` here so that the promises can complete before making the next assertion.
        tick();

        // etch1 and etch2 should have been encrypted and posted, but etch3 should still be in
        // the queue
        expect(component.queuedEtches).toEqual(['etch3']);

        expect(etchedApi.postEtches).toHaveBeenCalledTimes(1);
        expect(etchedApi.postEtches).toHaveBeenCalledWith('entryId', ['e', 'e']);
    }));

    it('onTitleChange updates title', () => {
        component.title = 'abcdef';
        component.onTitleChange('foobar');
        expect(component.title).toEqual('foobar');
    });

    it('destroy posts any queued etches when entry is defined', () => {
        const postEtchesSpy = spyOn(component, 'postEtches');
        // Have to mock out interval subscription
        component.queueIntervalSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);

        // Entry has to be defined in order to post queued etches
        component.entry = testEntry;
        component.ngOnDestroy();

        expect(postEtchesSpy).toHaveBeenCalledTimes(1);
    });

    it('destroy does not post if entry is not defined', () => {
        const postEtchesSpy = spyOn(component, 'postEtches');

        component.entry = undefined;
        component.queueIntervalSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);

        component.ngOnDestroy();

        expect(postEtchesSpy).toHaveBeenCalledTimes(0);
    });

    it('destroy unsubscribes interval subscription', () => {
        // Have to mock out interval subscription
        component.queueIntervalSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        component.entry = undefined;
        component.ngOnDestroy();
        expect(component.queueIntervalSubscription.unsubscribe).toHaveBeenCalledTimes(1);
    });
});
