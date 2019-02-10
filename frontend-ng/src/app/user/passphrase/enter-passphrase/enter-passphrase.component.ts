import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PASSPHRASE_VALIDATORS } from '../../form-utils';
import { PassphraseUtils } from '../passphrase-utils';

// TODO: Refactor passphrase components
// This whole class is basically the same as ConfigurePassphraseComponent
@Component({
    selector: 'app-enter-passphrase',
    templateUrl: './enter-passphrase.component.html',
    styleUrls: ['./enter-passphrase.component.css'],
})
export class EnterPassphraseComponent implements OnInit {
    public passphraseForm: FormGroup;
    public submitClicked: boolean;

    /** Specifies if the passphrase was not correct for this key */
    @Input()
    public passphraseIncorrect: boolean;

    @Output()
    public passphraseEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor(private fb: FormBuilder) {
        this.submitClicked = false;
    }

    public ngOnInit() {
        this.passphraseForm = this.fb.group({
            passphrase: ['', PASSPHRASE_VALIDATORS],
        });

        if (this.passphraseIncorrect === undefined) {
            this.passphraseIncorrect = false;
        }
    }

    public onSubmit() {
        this.submitClicked = true;
        if (this.passphraseForm.valid) {
            this.passphraseEmitter.emit(this.passphraseForm.controls.passphrase.value);
        }
    }

    public getPassphraseError() {
        if (this.passphraseIncorrect) {
            return 'Passphrase is incorrect';
        }
        if (!this.submitClicked) {
            return null;
        }
        const passphrase = this.passphraseForm.controls.passphrase;
        return PassphraseUtils.getPassphraseControlError(passphrase);
    }
}
