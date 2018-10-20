import { FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { User } from './constants';

export const USERNAME_VALIDATORS = Validators.compose([
    Validators.required,
    Validators.minLength(User.USERNAME_MIN_LENGTH),
    Validators.maxLength(User.USERNAME_MAX_LENGTH),
    // TODO: Add regex for username
]);

export const PASSWORD_VALIDATORS = Validators.compose([
    Validators.required,
    Validators.minLength(User.PASSWORD_MIN_LENGTH),
    Validators.maxLength(User.PASSWORD_MAX_LENGTH),
]);

export const EMAIL_VALIDATORS = Validators.compose([
    Validators.email
]);

export const PASSPHRASE_MIN_LENGTH: number = 16;

export const PASSPHRASE_VALIDATORS = Validators.compose([
    Validators.required,
    Validators.minLength(PASSPHRASE_MIN_LENGTH),
    // TODO: Should we have a max length?
    // Do we need to have a max length?
]);

export const passphraseMatchValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    // https://scotch.io/@ibrahimalsurkhi/match-password-validation-with-angular-2

    const passphrase = control.get('passphrase').value;
    const passphraseConfirm = control.get('passphraseConfirm').value;

    if (passphrase !== passphraseConfirm) {
        return {notSame: true};
    }
    return null;
};
