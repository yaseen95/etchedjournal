import { AbstractControl } from '@angular/forms';

export class PassphraseUtils {

    /**
     * Checks the passphrase control for any errors and returns an error message
     */
    public static getPassphraseControlError(control: AbstractControl): string | null {
        if (control.valid) {
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
