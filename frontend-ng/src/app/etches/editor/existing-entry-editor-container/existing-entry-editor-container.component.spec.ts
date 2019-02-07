import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MobxAngularModule } from 'mobx-angular';
import { EMPTY } from 'rxjs';
import { EntryEntity } from '../../../models/entry-entity';
import { EtchV1 } from '../../../models/etch';
import { EtchEntity } from '../../../models/etch-entity';
import { OwnerType } from '../../../models/owner-type';
import { Encrypter } from '../../../services/encrypter';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchesService } from '../../../services/etches.service';
import { EntryStore } from '../../../stores/entry.store';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryEditorComponent } from '../entry-editor/entry-editor.component';
import { EntryTitleComponent } from '../entry-title/entry-title.component';
import { EtchItemComponent } from '../etch-item/etch-item.component';
import {
    EntityState,
    ExistingEntryEditorContainerComponent
} from './existing-entry-editor-container.component';

describe('ExistingEntryEditorContainerComponent', () => {
    let component: ExistingEntryEditorContainerComponent;
    let fixture: ComponentFixture<ExistingEntryEditorContainerComponent>;
    let etchesServiceSpy: any;
    let encrypterSpy: any;
    let entryStore: any;

    const entry: EntryEntity = {
        timestamp: 1,
        owner: 'owner',
        ownerType: OwnerType.USER,
        id: 'entryId',
        content: 'Entry Title',
        keyPairId: 'kpId',
        journalId: 'jid',
        version: 1,
    };

    beforeEach(async(() => {
        etchesServiceSpy = jasmine.createSpyObj('EtchesService', ['getEtches']);
        etchesServiceSpy.getEtches.and.returnValue(EMPTY);

        entryStore = jasmine.createSpyObj('EntryStore', ['loadEntry']);
        entryStore.entries = [];
        entryStore.loading = false;

        entryStore.loadEntry.and.returnValue(Promise.resolve(entry));

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['decrypt']);
        encrypterSpy.keyPairId = 'kpId';

        const encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        TestBed.configureTestingModule({
            declarations: [
                ExistingEntryEditorContainerComponent,
                SpinnerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
                EtchItemComponent,
            ],
            imports: [
                ReactiveFormsModule,
                MobxAngularModule,
            ],
            providers: [
                {provide: EtchesService, useValue: etchesServiceSpy},
                {provide: EntryStore, useValue: entryStore},
                {provide: EncrypterService, useValue: encrypterService},
                {
                    provide: ActivatedRoute,
                    useValue: {
                        // https://stackoverflow.com/a/52895293
                        snapshot: {paramMap: convertToParamMap({'id': 'entryId'})}
                    }
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExistingEntryEditorContainerComponent);
        component = fixture.componentInstance;
        component.encrypter = encrypterSpy;
        fixture.detectChanges();
    });

    it('gets entry on create', () => {
        expect(entryStore.loadEntry).toHaveBeenCalledTimes(1);
        expect(entryStore.loadEntry).toHaveBeenCalledWith('entryId');
    });

    it('gets etches on create', () => {
        expect(etchesServiceSpy.getEtches).toHaveBeenCalledTimes(1);
        expect(etchesServiceSpy.getEtches).toHaveBeenCalledWith('entryId');
    });

    it('display spinner when loading entries and etches decrypted', () => {
        component.entryStore.loading = true;
        component.etchesState = EntityState.DECRYPTED;
        expect(component.entryStore.loading).toBe(true);
        expect(component.displaySpinner()).toBe(true);
    });

    it('display spinner when etches not decrypted', () => {
        entryStore.loading = false;
        for (const state of [EntityState.FETCHING, EntityState.DECRYPTING]) {
            component.etchesState = state;
            expect(component.displaySpinner()).toBe(true);
        }
    });

    it('do not display spinner when etches loaded and etches decrypted', () => {
        component.entryStore.loading = false;
        component.etchesState = EntityState.DECRYPTED;
        expect(component.displaySpinner()).toBe(false);
    });

    it('displays spinner', () => {
        component.entryStore.loading = true;
        component.etchesState = EntityState.FETCHING;
        expect(component.displaySpinner()).toBe(true);

        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Getting entry');
    });

    it('displays editor when decrypted', () => {
        entryStore.loading = false;
        component.etchesState = EntityState.DECRYPTED;
        component.etches = [{content: 'decrypted etch 1'}] as EtchV1[];
        component.title = 'Entry Title';

        expect(component.displaySpinner()).toBeFalsy();
        fixture.detectChanges();

        expect(component.title).toEqual('Entry Title');
        const titleDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-entry-title h4');
        expect(titleDe.nativeElement.innerText).toEqual('Entry Title');

        const etchListDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-etch-item');
        expect(etchListDe.nativeElement.innerText.trim()).toEqual('decrypted etch 1');
    });

    it('loads entry on init', fakeAsync(() => {
        const mockEntryStore = jasmine.createSpyObj('EntryStore', ['loadEntry']);
        const e = {content: 'foobarbaz'};
        mockEntryStore.loadEntry.and.returnValue(Promise.resolve(e));
        component.entryStore = mockEntryStore;

        component.ngOnInit();
        tick();

        expect(mockEntryStore.loadEntry).toHaveBeenCalledTimes(1);
        expect(component.title).toEqual('foobarbaz');
    }));

    it('decryptEtches', fakeAsync(() => {
        encrypterSpy.decrypt.and.returnValue(Promise.resolve('[{"content":"decrypted text"}]'));

        const etch1 = {
            timestamp: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            id: 'etch1',
            content: 'ENC1',
            keyPairId: 'kpId',
        } as EtchEntity;
        const etch2 = {
            timestamp: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            id: 'etch1',
            content: 'ENC2',
            keyPairId: 'kpId',
        } as EtchEntity;

        component.decryptEtches([etch1, etch2]);
        expect(component.etchesState).toEqual(EntityState.DECRYPTING);

        tick();

        expect(encrypterSpy.decrypt).toHaveBeenCalledTimes(2);
        expect(encrypterSpy.decrypt.calls.allArgs()).toEqual([['ENC1'], ['ENC2']]);

        const decryptedEtches = [{content: 'decrypted text'}, {content: 'decrypted text'}];
        expect(component.etches).toEqual(decryptedEtches as EtchV1[]);
        expect(component.etchesState).toEqual(EntityState.DECRYPTED);
    }));
});
