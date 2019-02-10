import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { User } from './constants';

export const nonWhitespaceValidator: ValidatorFn = (
    control: FormControl
): ValidationErrors | null => {
    const value = control.value;
    if (value.trim() === '') {
        return { isWhitespace: true };
    }
    return null;
};

export const passphraseMatchValidator: ValidatorFn = (
    control: FormGroup
): ValidationErrors | null => {
    // https://scotch.io/@ibrahimalsurkhi/match-password-validation-with-angular-2
    const passphrase = control.get('passphrase').value;
    const passphraseConfirm = control.get('passphraseConfirm').value;

    if (passphrase !== passphraseConfirm) {
        return { notSame: true };
    }
    return null;
};

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

export const EMAIL_VALIDATORS = Validators.compose([Validators.email]);

export const PASSPHRASE_MIN_LENGTH: number = 10;

export const PASSPHRASE_VALIDATORS = Validators.compose([
    Validators.required,
    Validators.minLength(PASSPHRASE_MIN_LENGTH),
    // TODO: Should we have a max length?
    // Do we need to have a max length?
]);

export namespace JournalFormUtils {
    export const JOURNAL_NAME_MIN_LENGTH: number = 1;
    export const JOURNAL_NAME_MAX_LENGTH: number = 30;
}

export const JOURNAL_NAME_VALIDATORS = Validators.compose([
    Validators.required,
    Validators.minLength(JournalFormUtils.JOURNAL_NAME_MIN_LENGTH),
    Validators.maxLength(JournalFormUtils.JOURNAL_NAME_MAX_LENGTH),
    nonWhitespaceValidator,
]);
