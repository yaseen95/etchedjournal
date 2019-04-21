import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NavigationExtras, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { ClockService } from '../../../services/clock.service';
import { FakeClock } from '../../../services/clock.service.spec';
import { FakeJournalStore } from '../../../services/fakes.service.spec';
import { JournalEntity } from '../../../services/models/journal-entity';
import { Schema } from '../../../services/models/schema';
import { JournalStore } from '../../../stores/journal.store';
import { TestUtils } from '../../../utils/test-utils.spec';
import { CreateJournalComponent } from './create-journal.component';

describe('CreateJournalComponent', () => {
    let component: CreateJournalComponent;
    let fixture: ComponentFixture<CreateJournalComponent>;
    let routerSpy: any;
    let createJournalForm: FormGroup;
    let journalStore: JournalStore;
    let clock: FakeClock;

    beforeEach(async(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        journalStore = new FakeJournalStore();
        clock = new FakeClock(0);

        TestBed.configureTestingModule({
            declarations: [CreateJournalComponent],
            imports: [ReactiveFormsModule, RouterTestingModule],
            providers: [
                { provide: JournalStore, useValue: journalStore },
                { provide: Router, useValue: routerSpy },
                { provide: ClockService, useValue: clock },
            ],
        }).compileComponents();
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
        const nameControl = createJournalForm.controls.journalName;
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
        const nameControl = createJournalForm.controls.journalName;
        nameControl.setValue('   \n \n\t ');
        expect(nameControl.errors.isWhitespace).toBeTruthy();
        expect(createJournalForm.valid).toBeFalsy();
    });

    it('form is invalid when name is too long', () => {
        const nameControl = createJournalForm.controls.journalName;
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

    it('creates journal', async () => {
        const createJournalSpy = spyOn(journalStore, 'createJournal');
        const entity = {
            id: 'jid',
            content: 'ciphertext',
            schema: Schema.V1_0,
        } as JournalEntity;
        createJournalSpy.and.returnValue(entity);

        clock.time = 123;
        await component.createJournal('title');

        expect(createJournalSpy).toHaveBeenCalledTimes(1);
        expect(createJournalSpy).toHaveBeenCalledWith(new JournalV1({
            name: 'title',
            created: 123,
        }));
    });

    it('navigates to create entry page after creating journal', fakeAsync(() => {
        const nameControl = createJournalForm.controls.journalName;
        nameControl.setValue('title');

        const createJournalSpy = spyOn(journalStore, 'createJournal');
        const entity = {
            id: '1234567890abcdef',
            content: 'ciphertext',
            schema: Schema.V1_0,
        } as JournalEntity;
        createJournalSpy.and.returnValue(Promise.resolve(entity));
        component.createJournal('title');

        tick();

        expect(component.creatingJournal).toBeFalsy();
        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        const navExtras: NavigationExtras = { queryParams: { journalId: entity.id } };
        expect(routerSpy.navigate).toHaveBeenCalledWith(['entries/new'], navExtras);
    }));
});
