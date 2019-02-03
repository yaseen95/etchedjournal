import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JournalEntity } from '../../../models/journal-entity';
import { OwnerType } from '../../../models/owner-type';
import { JournalStore } from '../../../stores/journal.store';
import { FakeJournalStore } from '../../../stores/journal.store.spec';
import { TestUtils } from '../../../utils/test-utils.spec';
import { CreateJournalComponent } from './create-journal.component';

describe('CreateJournalComponent', () => {
    let component: CreateJournalComponent;
    let fixture: ComponentFixture<CreateJournalComponent>;
    let routerSpy: any;
    let createJournalForm: FormGroup;
    let journalStore: JournalStore;

    beforeEach(async(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        journalStore = new FakeJournalStore();

        TestBed.configureTestingModule({
            declarations: [CreateJournalComponent],
            imports: [
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            providers: [
                {provide: JournalStore, useValue: journalStore},
                {provide: Router, useValue: routerSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateJournalComponent);
        component = fixture.componentInstance;
        createJournalForm = component.createJournalForm;
        fixture.detectChanges();
    });

    it('displays spinning icon in button while creating journal', () => {
        component.creatingJournal = true;
        fixture.detectChanges();
        const iconDe = fixture.debugElement.query(By.css('button.span.icon'));
        expect(iconDe).toBeDefined();
    });

    it('does not display spinning icon in button when not creating journal', () => {
        component.creatingJournal = false;
        fixture.detectChanges();
        const iconDe = fixture.debugElement.query(By.css('button.span.icon'));
        expect(iconDe).toBeNull();
    });

    it('form is invalid by default', () => {
        expect(createJournalForm.valid).toBeFalsy();
    });

    it('form is valid', () => {
        const nameControl = createJournalForm.controls['journalName'];
        nameControl.setValue('journal title');
        expect(nameControl.valid).toBeTruthy();
        expect(createJournalForm.valid).toBeTruthy();
    });

    it('create journal form only contains one control', () => {
        // Should only be one control.
        // This test exists just to make sure that we update the tests when we add a new control
        // tp the from
        expect(Object.keys(createJournalForm.controls).length).toEqual(1);
    });

    it('form is invalid when name is all blanks', () => {
        const nameControl = createJournalForm.controls['journalName'];
        nameControl.setValue('   \n \n\t ');
        expect(nameControl.errors.isWhitespace).toBeTruthy();
        expect(createJournalForm.valid).toBeFalsy();
    });

    it('form is invalid when name is too long', () => {
        const nameControl = createJournalForm.controls['journalName'];
        nameControl.setValue('a'.repeat(31));
        expect(nameControl.errors.maxlength).toBeTruthy();
        expect(createJournalForm.valid).toBeFalsy();
    });

    it('displays error when name is all blanks', () => {
        const nameInputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        TestUtils.updateValue(nameInputDe.nativeElement, '\n\n  ');
        component.submitClicked = true;
        fixture.detectChanges();

        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.innerText).toEqual('Cannot be blank');
    });

    it('displays error when name is too long', () => {
        const nameInputDe = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        TestUtils.updateValue(nameInputDe.nativeElement, 'a'.repeat(100));
        component.submitClicked = true;
        fixture.detectChanges();

        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.innerText).toEqual('Cannot be more than 30 characters long');
    });

    it('displays error only after submit is clicked', () => {
        // Precondition - form is invalid
        expect(component.createJournalForm.valid).toBeFalsy();

        component.submitClicked = false;
        fixture.detectChanges();
        // No error should be visible
        TestUtils.queryExpectNone(fixture.debugElement, 'p.error-help');

        // Should display error after submit is clicked
        component.submitClicked = true;
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
    });

    it('button click updates submitClicked', () => {
        // Precondition - submitClicked is false
        expect(component.submitClicked).toBeFalsy();

        const btnDe = TestUtils.queryExpectOne(fixture.debugElement, 'button');
        btnDe.nativeElement.click();
        fixture.detectChanges();

        expect(component.submitClicked).toBeTruthy();
    });

    it('navigates to create entry page after creating journal', fakeAsync(() => {
        const nameControl = createJournalForm.controls['journalName'];
        nameControl.setValue('title');

        const createJournalSpy = spyOn(journalStore, 'createJournal');
        const journal: JournalEntity = {
            id: '1234567890abcdef',
            owner: 'owner',
            ownerType: OwnerType.USER,
            content: 'content',
            timestamp: 1,
            keyPairId: 'kpId',
            version: 1,
        };
        createJournalSpy.and.returnValue(Promise.resolve(journal));
        component.createJournal();

        tick();

        expect(component.creatingJournal).toBeFalsy();
        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        const navExtras: NavigationExtras = {queryParams: {journalId: journal.id}};
        expect(routerSpy.navigate).toHaveBeenCalledWith(['entries/new'], navExtras);
    }));
});
