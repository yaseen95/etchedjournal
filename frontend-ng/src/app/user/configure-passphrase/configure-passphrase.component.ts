import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    PASSPHRASE_MIN_LENGTH,
    PASSPHRASE_VALIDATORS,
    passphraseMatchValidator,
} from '../form-utils';
import { PassphraseUtils } from '../passphrase/passphrase-utils';

@Component({
    selector: 'app-configure-passphrase',
    templateUrl: './configure-passphrase.component.html',
    styleUrls: ['./configure-passphrase.component.css'],
})
export class ConfigurePassphraseComponent implements OnInit {
    public passphraseForm: FormGroup;
    public submitClicked: boolean;
    @Input()
    public userId: string;
    @Output()
    public passphraseEmitter: EventEmitter<string> = new EventEmitter<string>();

    public PASSPHRASE_MIN_LENGTH: number = PASSPHRASE_MIN_LENGTH;

    constructor(private fb: FormBuilder) {
        this.submitClicked = false;
    }

    public ngOnInit() {
        this.passphraseForm = this.fb.group(
            {
                passphrase: ['', PASSPHRASE_VALIDATORS],
                passphraseConfirm: ['', PASSPHRASE_VALIDATORS],
            },
            {
                // FormBuilder uses "validator" but FormGroup uses "validators", spent like half an
                // hour debugging that...
                validator: [passphraseMatchValidator],
            }
        );
    }

    public onSubmit() {
        this.submitClicked = true;
        if (this.passphraseForm.valid) {
            // Configure the passphrase if the from is valid
            this.passphraseEmitter.emit(this.passphraseForm.controls.passphrase.value);
        }
    }

    public getPassphraseError() {
        const passphrase = this.passphraseForm.controls.passphrase;
        if (!this.submitClicked) {
            return null;
        }
        return PassphraseUtils.getPassphraseControlError(passphrase);
    }
}
