import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import {
    EntityState,
    ExistingEntryEditorContainerComponent
} from './existing-entry-editor-container.component';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { EntryTitleComponent } from '../entry-title/entry-title.component';
import { EntryEditorComponent } from '../entry-editor/entry-editor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EtchedApiService } from '../../../services/etched-api.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { EMPTY } from 'rxjs';
import { OwnerType } from '../../../models/owner-type';
import { Encrypter } from '../../../services/encrypter';
import { EncrypterService } from '../../../services/encrypter.service';
import { TestUtils } from '../../../utils/test-utils.spec';

describe('ExistingEntryEditorContainerComponent', () => {
    let component: ExistingEntryEditorContainerComponent;
    let fixture: ComponentFixture<ExistingEntryEditorContainerComponent>;
    let etchedApiSpy: any;
    let encrypterSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['getEntry', 'getEtches']);
        etchedApiSpy.getEntry.and.returnValue(EMPTY);
        etchedApiSpy.getEtches.and.returnValue(EMPTY);

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['decrypt']);
        encrypterSpy.decrypt.and.returnValue(Promise.resolve('decrypted text'));

        const encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        TestBed.configureTestingModule({
            declarations: [
                ExistingEntryEditorContainerComponent,
                SpinnerComponent,
                EntryTitleComponent,
                EntryEditorComponent,
            ],
            imports: [ReactiveFormsModule],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('gets entry on create', () => {
        expect(etchedApiSpy.getEntry).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.getEntry).toHaveBeenCalledWith('entryId');
    });

    it('gets etches on create', () => {
        expect(etchedApiSpy.getEtches).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.getEtches).toHaveBeenCalledWith('entryId');
    });

    it('displays spinner when getting entries', () => {
        component.entryState = EntityState.FETCHING;
        component.etchesState = EntityState.FETCHING;

        fixture.detectChanges();

        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Getting entry');
    });

    it('displays spinner when getting etches', () => {
        component.entryState = EntityState.DECRYPTED;
        component.etchesState = EntityState.FETCHING;

        fixture.detectChanges();

        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Getting entry');
    });

    it('displays spinner when decrypting entry', () => {
        component.entryState = EntityState.DECRYPTING;
        component.etchesState = EntityState.DECRYPTED;

        fixture.detectChanges();

        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Decrypting');
    });

    it('displays spinner when decrypting etches', () => {
        component.entryState = EntityState.DECRYPTED;
        component.etchesState = EntityState.DECRYPTING;

        fixture.detectChanges();

        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Decrypting');
    });

    it('displays editor when decrypted', () => {
        component.entryState = EntityState.DECRYPTED;
        component.etchesState = EntityState.DECRYPTED;

        component.entry = {
            timestamp: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            id: 'entryId',
            content: 'Entry Title'
        };
        component.decryptedEtches = ['decrypted etch 1'];
        component.title = 'Entry Title';

        fixture.detectChanges();

        const titleDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-entry-title h4');
        expect(titleDe.nativeElement.innerText).toEqual('Entry Title');

        const etchListDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-editor ul li');
        expect(etchListDe.nativeElement.innerText).toEqual('decrypted etch 1');
    });

    it('decryptEntry', fakeAsync(() => {
        const entry = {
            timestamp: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            id: 'entryId',
            content: 'ENCRYPTED'
        };

        component.decryptEntry(entry);
        expect(component.entryState).toEqual(EntityState.DECRYPTING);

        tick();

        expect(encrypterSpy.decrypt).toHaveBeenCalledTimes(1);
        expect(component.entry.content).toEqual('decrypted text');
        expect(component.title).toEqual('decrypted text');
        expect(component.entryState).toEqual(EntityState.DECRYPTED);
    }));

    it('decryptEtches', fakeAsync(() => {
        const etch1 = {
            timestamp: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            id: 'etch1',
            content: 'ENC1'
        };
        const etch2 = {
            timestamp: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            id: 'etch1',
            content: 'ENC2'
        };

        component.decryptEtches([etch1, etch2]);
        expect(component.etchesState).toEqual(EntityState.DECRYPTING);

        tick();

        expect(encrypterSpy.decrypt).toHaveBeenCalledTimes(2);
        expect(encrypterSpy.decrypt.calls.allArgs()).toEqual([['ENC1'], ['ENC2']]);

        expect(component.decryptedEtches).toEqual(['decrypted text', 'decrypted text']);
        expect(component.etchesState).toEqual(EntityState.DECRYPTED);
    }));
});
