import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterPassphraseComponent } from './enter-passphrase.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { TestUtils } from '../../../utils/test-utils.spec';

describe('EnterPassphraseComponent', () => {
    let component: EnterPassphraseComponent;
    let fixture: ComponentFixture<EnterPassphraseComponent>;
    let passphraseEvents: string[];
    let passphraseForm: FormGroup;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EnterPassphraseComponent],
            imports: [ReactiveFormsModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        passphraseEvents = [];

        fixture = TestBed.createComponent(EnterPassphraseComponent);
        component = fixture.componentInstance;
        component.passphraseEmitter.subscribe(passphrase => passphraseEvents.push(passphrase));
        fixture.detectChanges();

        passphraseForm = component.passphraseForm;
    });

    it('form valid', () => {
        expect(passphraseForm.valid).toBeFalsy();

        const passphraseControl = passphraseForm.controls['passphrase'];
        passphraseControl.setValue('1234567890123456');

        // Should only be two controls
        expect(Object.keys(passphraseForm.controls).length).toEqual(1);
        expect(passphraseForm.valid).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(passphraseForm.valid).toBeFalsy();
    });

    it('empty form displays error after submit', () => {
        const formDe = TestUtils.queryExpectOne(fixture.debugElement, 'form');
        const passphraseInputDe = TestUtils.queryExpectOne(formDe, 'input[type=password]');

        TestUtils.updateValue(passphraseInputDe.nativeElement, '');

        const submitBtnDe = TestUtils.queryExpectOne(formDe, 'button[type=submit]');
        (submitBtnDe.nativeElement as HTMLButtonElement).click();

        fixture.detectChanges();

        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.innerText).toEqual('Passphrase is required');
    });

    it('error message displayed when passphraseIncorrect is true', () => {
        component.passphraseIncorrect = true;

        fixture.detectChanges();

        const errorDe = TestUtils.queryExpectOne(fixture.debugElement, 'p.error-help');
        expect(errorDe.nativeElement.innerText).toEqual('Passphrase is incorrect');
    });

    it('submit emits a passphrase', () => {
        const passphraseControl = passphraseForm.controls['passphrase'];
        passphraseControl.setValue('passphrasepassphrase');

        component.onSubmit();

        expect(component.submitClicked).toBeTruthy();
        expect(passphraseEvents.length).toEqual(1);
        expect(passphraseEvents[0]).toEqual('passphrasepassphrase');
    });

    it('button submit triggers onSubmit', () => {
        spyOn(component, 'onSubmit').and.callThrough();
        const loginElementDe: DebugElement = fixture.debugElement;

        const formDe = TestUtils.queryExpectOne(loginElementDe, 'form');
        const passphraseInputDe = TestUtils.queryExpectOne(formDe, 'input[type=password]');
        const submitBtnDe = TestUtils.queryExpectOne(formDe, 'button[type=submit]');

        // Update the form with valid values
        TestUtils.updateValue(passphraseInputDe.nativeElement, 'correct horse battery staple');

        // Refresh the UI
        fixture.detectChanges();

        // The form should be valid and button click should trigger a form submit
        (submitBtnDe.nativeElement as HTMLButtonElement).click();
        expect(component.onSubmit).toHaveBeenCalledTimes(1);
        expect(passphraseEvents.length).toEqual(1);
        expect(passphraseEvents[0]).toEqual('correct horse battery staple');
    });

    afterEach(() => {
        passphraseEvents = [];
    })
});
