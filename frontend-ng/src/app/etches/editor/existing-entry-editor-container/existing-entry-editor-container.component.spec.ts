import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MobxAngularModule } from 'mobx-angular';
import { EntryV1 } from '../../../models/entry/entry-v1';
import { EtchV1 } from '../../../models/etch/etch';
import { FakeEntryStore } from '../../../services/fakes.service.spec';
import { EntryEntity } from '../../../services/models/entry-entity';
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
    let entryStore: FakeEntryStore;
    let etchStore: any;
    let getEntrySpy: any;

    const entryEntity: EntryEntity = TestUtils.createEntryEntity({ id: 'entryId' });
    const entry: EntryV1 = new EntryV1({ content: 'Entry Title', created: 1000 });

    beforeEach(async(() => {
        entryStore = new FakeEntryStore();
        entryStore.entriesById.set(entryEntity.id, entry);

        getEntrySpy = spyOn(entryStore, 'getEntry');
        getEntrySpy.and.returnValue(Promise.resolve(entryEntity));

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
            imports: [ReactiveFormsModule, MobxAngularModule],
            providers: [
                { provide: EtchStore, useValue: etchStore },
                { provide: EntryStore, useValue: entryStore },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        // https://stackoverflow.com/a/52895293
                        snapshot: { paramMap: convertToParamMap({ id: 'entryId' }) },
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExistingEntryEditorContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('gets entry on create', () => {
        expect(getEntrySpy).toHaveBeenCalledTimes(1);
        expect(getEntrySpy).toHaveBeenCalledWith('entryId');
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
        component.etchStore.state.parsedEtches = [{ content: 'decrypted etch 1' }] as EtchV1[];
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
        // ngOnInit is called when the component is first created
        tick();
        expect(getEntrySpy).toHaveBeenCalledTimes(1);
    }));
});
