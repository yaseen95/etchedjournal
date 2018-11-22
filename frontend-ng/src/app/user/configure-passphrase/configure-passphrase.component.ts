import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import {
    PASSPHRASE_MIN_LENGTH,
    PASSPHRASE_VALIDATORS,
    passphraseMatchValidator
} from '../form-utils';
import { Encrypter } from '../../services/encrypter';

@Component({
    selector: 'app-configure-passphrase',
    templateUrl: './configure-passphrase.component.html',
    styleUrls: ['./configure-passphrase.component.css']
})
export class ConfigurePassphraseComponent implements OnInit {

    passphraseForm: FormGroup;
    submitClicked: boolean;

    PASSPHRASE_MIN_LENGTH: number = PASSPHRASE_MIN_LENGTH;

    @Input()
    userId: string;

    @Output()
    passphraseEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor(private fb: FormBuilder) {
        this.submitClicked = false;
    }

    ngOnInit() {
        this.passphraseForm = this.fb.group({
            passphrase: ['', PASSPHRASE_VALIDATORS],
            passphraseConfirm: ['', PASSPHRASE_VALIDATORS],
        }, {
            // FormBuilder uses "validator" but FormGroup uses "validators", spent like half an
            // hour debugging that...
            validator: [passphraseMatchValidator]
        });
    }

    onSubmit() {
        this.submitClicked = true;
        if (this.passphraseForm.valid) {
            // Configure the passphrase if the from is valid
            this.configurePassphrase();
        }
    }

    configurePassphrase() {
        this.passphraseEmitter.emit(this.passphraseForm.controls.passphrase.value);
    }

    getPassphraseError() {
        const passphrase = this.passphraseForm.controls.passphrase;
        return this.passphraseErrorMsg(passphrase);
    }

    private passphraseErrorMsg(control: AbstractControl): string | null {
        if (!this.submitClicked || control.valid) {
            return null;
        }

        if (control.errors.required) {
            return 'Passphrase is required';
        } else if (control.errors.minlength) {
            const minLength = control.errors.minlength.requiredLength;
            return `Passphrase must be at least ${minLength} characters long`;
        }
        console.warn(`Unexpected form error ${JSON.stringify(control.errors)}`);
        return 'Passphrase is invalid';
    }
}
