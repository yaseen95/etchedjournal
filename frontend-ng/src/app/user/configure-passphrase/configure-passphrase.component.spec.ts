import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurePassphraseComponent } from './configure-passphrase.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import TestUtils from '../../utils/test-utils.spec';
import { By } from '@angular/platform-browser';

describe('ConfigurePassphraseComponent', () => {
    let component: ConfigurePassphraseComponent;
    let fixture: ComponentFixture<ConfigurePassphraseComponent>;
    let passphraseForm: FormGroup;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfigurePassphraseComponent, SpinnerComponent],
            imports: [ReactiveFormsModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurePassphraseComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();

        passphraseForm = component.passphraseForm;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('empty form is invalid', () => {
        expect(passphraseForm.valid).toBeFalsy();
    })

    it('form valid', () => {
        // Should only be two controls
        expect(Object.keys(passphraseForm.controls).length).toEqual(2);

        const passphraseControl = passphraseForm.controls['passphrase'];
        const passphraseConfirmControl = passphraseForm.controls['passphraseConfirm'];

        passphraseControl.setValue('1234567890123456');
        passphraseConfirmControl.setValue('1234567890123456');

        expect(passphraseForm.valid).toBeTruthy();
    });

    it('passphrase is required', () => {
        // Check form values are invalid
        const passphraseControl = passphraseForm.controls['passphrase'];
        passphraseControl.setValue('');
        expect(passphraseForm.valid).toBeFalsy();
        expect(passphraseControl.hasError('required')).toBeTruthy();

        // Check that error is displayed after submit
        component.submitClicked = true;
        fixture.detectChanges();

        const debugElement = fixture.debugElement;
        const errorMsgDe = TestUtils.queryExpectOne(debugElement, 'p.error-help');

        const errorMsgEl = errorMsgDe.nativeElement as HTMLParagraphElement;
        expect(errorMsgEl.textContent.trim()).toEqual('Passphrase is required');
    });

    it('passphrase is too short', () => {
        const passphraseControl = passphraseForm.controls['passphrase'];
        passphraseControl.setValue('abc');  // too short
        expect(passphraseForm.valid).toBeFalsy();
        expect(passphraseControl.hasError('minlength')).toBeTruthy();
        expect(passphraseControl.errors.minlength.requiredLength).toEqual(16);

        // Check that error is displayed after submit
        component.submitClicked = true;
        fixture.detectChanges();

        const debugElement = fixture.debugElement;

        const errorMsgs = debugElement.queryAll(By.css('p.error-help'));
        // Expect 2 error messages one for passphrase being short and one for passphraseConfirm
        // not matching
        expect(errorMsgs.length).toEqual(2);

        const passphraseErrorMsg = errorMsgs[0];
        const passphraseErrorMsgEl = passphraseErrorMsg.nativeElement as HTMLParagraphElement;
        expect(passphraseErrorMsgEl.textContent.trim())
            .toEqual('Passphrase must be at least 16 characters long');

        const confirmErrorMsg = errorMsgs[1];
        const confirmErrorMsgEl = confirmErrorMsg.nativeElement as HTMLParagraphElement;
        expect(confirmErrorMsgEl.textContent.trim())
            .toEqual("Passphrase doesn't match");
    });

    it('passphrase and confirm dont match', () => {
        const passphraseControl = passphraseForm.controls['passphrase'];
        const confirmControl = passphraseForm.controls['passphraseConfirm'];

        passphraseControl.setValue('abcdefghijklmnop');
        confirmControl.setValue('1234567890123456');

        expect(passphraseControl.valid).toBeTruthy();
        expect(confirmControl.valid).toBeTruthy();
        // The individual controls are valid but the overall form isn't because they don't match
        expect(passphraseForm.valid).toBeFalsy();

        // Check that error is displayed after submit
        component.submitClicked = true;
        fixture.detectChanges();

        const debugElement = fixture.debugElement;

        const errorMsgDe = TestUtils.queryExpectOne(debugElement, 'p.error-help');
        const confirmErrorMsgEl = errorMsgDe.nativeElement as HTMLParagraphElement;
        expect(confirmErrorMsgEl.textContent.trim())
            .toEqual("Passphrase doesn't match");
    });

    it('errors are not visible until submit is clicked', () => {
        const passphraseControl = passphraseForm.controls['passphrase'];
        passphraseControl.setValue('abc');
        expect(passphraseForm.valid).toBeFalsy();

        fixture.detectChanges();

        // Error messages should not exist
        let errorElems = fixture.debugElement.queryAll(By.css('p.error-help'));
        expect(errorElems.length).toEqual(0);

        // Check that error is displayed after submit
        const submitBtnDe = TestUtils.queryExpectOne(fixture.debugElement, 'button[type=submit]');
        (submitBtnDe.nativeElement as HTMLButtonElement).click();
        fixture.detectChanges();

        errorElems = fixture.debugElement.queryAll(By.css('p.error-help'));
        expect(errorElems.length).toEqual(2);

        const shortErrorMsgEl = errorElems[0].nativeElement as HTMLParagraphElement;
        const notSameErrorMsgEl = errorElems[1].nativeElement as HTMLParagraphElement;

        expect(shortErrorMsgEl.textContent.trim())
            .toEqual('Passphrase must be at least 16 characters long');
        expect(notSameErrorMsgEl.textContent.trim()).toEqual("Passphrase doesn't match");
    });

    it('spinner is shown when request is in flight and form is hidden', () => {
        component.inFlight = true;
        fixture.detectChanges();

        const formElems = fixture.debugElement.queryAll(By.css('form'));
        expect(formElems.length).toEqual(0);

        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'p');
        const spinnerEl = spinnerDe.nativeElement as HTMLParagraphElement;
        expect(spinnerEl.textContent).toEqual('Setting passphrase');
    });
});
