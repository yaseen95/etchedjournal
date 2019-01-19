import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { TestUtils } from '../../../utils/test-utils.spec';
import { EntryTitleComponent } from './entry-title.component';

describe('EntryTitleComponent', () => {
    let component: EntryTitleComponent;
    let fixture: ComponentFixture<EntryTitleComponent>;
    let emittedEvents: Array<string> = [];

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntryTitleComponent],
            imports: [ReactiveFormsModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntryTitleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.titleEmitter.subscribe(title => emittedEvents.push(title));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('title is not editable at start', () => {
        expect(component.isEditing).toBeFalsy();
    });

    it('title is emitted on init when undefined', () => {
        component.title = undefined;
        component.ngOnInit();
        expect(emittedEvents.length).toEqual(1);
        // expect non empty string as the total
        // Title emitted is usually Date.toLocaleString() e.g. 19/01/2019
        expect(emittedEvents[0].trim().length).toBeGreaterThan(1);
        expect(component.title).toEqual(emittedEvents[0]);
        expect(component.prevTitle).toEqual(emittedEvents[0]);
    });

    it('title provided in input does not emit', () => {
        component.title = 'title is provided';
        component.ngOnInit();
        expect(emittedEvents.length).toEqual(0);
        expect(component.title).toEqual('title is provided');
        expect(component.prevTitle).toEqual('title is provided');
    });

    it('title view when not editing', () => {
        component.title = 'test title';
        fixture.detectChanges();

        // Title is visible
        const titleEl = TestUtils.queryExpectOne(fixture.debugElement, 'h4');
        expect(titleEl.nativeElement.textContent).toEqual('test title');

        // edit button is visible
        const buttonEl = TestUtils.queryExpectOne(fixture.debugElement, 'button');
        expect(buttonEl.nativeElement.innerText).toEqual('Edit');

        // The title input box should not be visible
        TestUtils.queryExpectNone(fixture.debugElement, 'input');
    });

    it('edit button triggers edit mode', () => {
        const editBtnDe = TestUtils.queryExpectOne(fixture.debugElement, 'button');
        expect(editBtnDe.nativeElement.innerText).toEqual('Edit');

        // the form should be populated with title when the edit button is clicked, we set it
        // here so it's deterministic
        component.title = 'abcdef';

        editBtnDe.nativeElement.click();

        expect(component.isEditing).toBeTruthy();
        expect(component.titleForm.controls.title.value).toEqual('abcdef');

        fixture.detectChanges();

        // Heading should not be visible
        TestUtils.queryExpectNone(fixture.debugElement, 'h4');
        TestUtils.queryExpectNone(fixture.debugElement, '#edit-button');

        // title input should now be visible and filled in with the title
        const input = TestUtils.queryExpectOne(fixture.debugElement, 'input');
        expect(input.nativeElement.value).toEqual('abcdef');
    });

    it('save button updates title', () => {
        component.titleForm.controls.title.setValue('abc');
        component.title = 'abc';
        component.isEditing = true;

        fixture.detectChanges();

        // Update the form input
        component.titleForm.controls.title.setValue('foo');

        // Click the button
        const toggleEditSpy = spyOn(component, 'toggleEdit').and.callThrough();
        const buttonEl = TestUtils.queryExpectOne(fixture.debugElement, '#save-button');
        expect(buttonEl.nativeElement.innerText).toEqual('Save');
        buttonEl.nativeElement.click();

        expect(toggleEditSpy).toHaveBeenCalledTimes(1);
        expect(toggleEditSpy).toHaveBeenCalledWith(true);

        // title should have been updated
        expect(component.title).toEqual('foo');
        expect(component.isEditing).toBeFalsy();
        expect(emittedEvents.length).toEqual(1);
        expect(emittedEvents[0]).toEqual('foo');

        fixture.detectChanges();

        // Should go back into non-edit mode and display the new title as the heading
        const headingEl = TestUtils.queryExpectOne(fixture.debugElement, 'h4');
        expect(headingEl.nativeElement.textContent).toEqual('foo');
    });

    it('cancel button does not update title', () => {
        // Set title to 'abc' initially
        component.titleForm.controls.title.setValue('abc');
        component.title = 'abc';
        component.isEditing = true;

        fixture.detectChanges();

        // Update the form input
        component.titleForm.controls.title.setValue('foo');

        // Click the button
        const toggleEditSpy = spyOn(component, 'toggleEdit').and.callThrough();
        const buttonEl = TestUtils.queryExpectOne(fixture.debugElement, '#cancel-button');
        expect(buttonEl.nativeElement.innerText).toEqual('Cancel');
        buttonEl.nativeElement.click();

        expect(toggleEditSpy).toHaveBeenCalledTimes(1);

        // title should NOT have been updated
        expect(component.title).toEqual('abc');
        expect(component.isEditing).toBeFalsy();
        expect(emittedEvents.length).toEqual(0);

        fixture.detectChanges();

        // Should go back into non-edit mode and display the previous title as the heading
        const headingEl = TestUtils.queryExpectOne(fixture.debugElement, 'h4');
        expect(headingEl.nativeElement.textContent).toEqual('abc');
    });

    it('form invalid when empty', () => {
        // Set title to 'abc' initially
        component.titleForm.controls.title.setValue('');
        component.isEditing = true;

        fixture.detectChanges();

        expect(component.titleForm.valid).toBeFalsy();
        expect(component.titleForm.controls.title.errors.required).toBeTruthy();
        expect(component.titleForm.controls.title.errors.isWhitespace).toBeTruthy();

        // error message is visible
        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.textContent.trim()).toEqual('Cannot be empty');

        // button should be disabled because the input is invalid
        const saveBtnDe = TestUtils.queryExpectOne(fixture.debugElement, '#save-button');
        expect(saveBtnDe.nativeElement.disabled).toBeTruthy();
    });

    it('form invalid when too long', () => {
        // Set title to a long value
        component.titleForm.controls.title.setValue('a'.repeat(101));
        component.isEditing = true;

        fixture.detectChanges();

        expect(component.titleForm.valid).toBeFalsy();
        expect(component.titleForm.controls.title.errors.maxlength).toBeDefined();
        expect(component.titleForm.controls.title.errors.maxlength.requiredLength).toEqual(100);

        // error message is visible
        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.textContent.trim())
            .toEqual('Title cannot be more than 100 characters long');

        // button should be disabled because the input is invalid
        const saveBtnDe = TestUtils.queryExpectOne(fixture.debugElement, '#save-button');
        expect(saveBtnDe.nativeElement.disabled).toBeTruthy();
    });

    it('form invalid when whitespace', () => {
        // Set title to whitespace
        component.titleForm.controls.title.setValue('  \n\t   ');
        component.isEditing = true;

        fixture.detectChanges();

        expect(component.titleForm.valid).toBeFalsy();
        expect(component.titleForm.controls.title.errors.isWhitespace).toBeTruthy();

        // error message is visible
        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.textContent.trim()).toEqual('Title cannot be blank');

        // button should be disabled because the input is invalid
        const saveBtnDe = TestUtils.queryExpectOne(fixture.debugElement, '#save-button');
        expect(saveBtnDe.nativeElement.disabled).toBeTruthy();
    });

    afterEach(() => {
        // Reset the emitted titles
        emittedEvents = [];
    });
});
