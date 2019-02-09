import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MobxAngularModule } from 'mobx-angular';
import { EntryEntity } from '../../../models/entry-entity';
import { EtchV1 } from '../../../models/etch';
import { OwnerType } from '../../../models/owner-type';
import { EntryStore } from '../../../stores/entry.store';
import { EtchStore } from '../../../stores/etch.store';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryEditorComponent } from '../entry-editor/entry-editor.component';
import { EntryTitleComponent } from '../entry-title/entry-title.component';
import { EtchItemComponent } from '../etch-item/etch-item.component';
import { ExistingEntryEditorContainerComponent } from './existing-entry-editor-container.component';

describe('ExistingEntryEditorContainerComponent', () => {
    let component: ExistingEntryEditorContainerComponent;
    let fixture: ComponentFixture<ExistingEntryEditorContainerComponent>;
    let entryStore: any;
    let etchStore: any;

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
        entryStore = jasmine.createSpyObj('EntryStore', ['loadEntry']);
        entryStore.entries = [];
        entryStore.loading = false;
        entryStore.loadEntry.and.returnValue(Promise.resolve(entry));

        etchStore = jasmine.createSpyObj('EtchStore', ['loadEtches']);
        etchStore.state = {
            loading: false,
            etches: [],
            parsedEtches: [],
        };
        etchStore.loadEtches.and.returnValue(Promise.resolve());

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
                {provide: EtchStore, useValue: etchStore},
                {provide: EntryStore, useValue: entryStore},
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
        fixture.detectChanges();
    });

    it('gets entry on create', () => {
        expect(entryStore.loadEntry).toHaveBeenCalledTimes(1);
        expect(entryStore.loadEntry).toHaveBeenCalledWith('entryId');
    });

    it('gets etches on create', () => {
        expect(etchStore.loadEtches).toHaveBeenCalledTimes(1);
        expect(etchStore.loadEtches).toHaveBeenCalledWith('entryId');
    });

    it('display spinner when loading entries and etches decrypted', () => {
        component.entryStore.loading = true;
        component.etchStore.state.loading = false;
        expect(component.displaySpinner()).toBe(true);
    });

    it('display spinner when etches not decrypted', () => {
        component.entryStore.loading = false;
        component.etchStore.state.loading = true;
        expect(component.displaySpinner()).toBe(true);
    });

    it('do not display spinner when etches loaded and etches decrypted', () => {
        component.entryStore.loading = false;
        component.etchStore.state.loading = false;
        expect(component.displaySpinner()).toBe(false);
    });

    it('displays spinner', () => {
        component.entryStore.loading = true;
        component.etchStore.state.loading = true;
        expect(component.displaySpinner()).toBe(true);

        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Getting entry');
    });

    it('displays editor when decrypted', () => {
        component.entryStore.loading = false;
        component.etchStore.state.loading = false;
        component.etchStore.state.parsedEtches = [{content: 'decrypted etch 1'}] as EtchV1[];
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
});
