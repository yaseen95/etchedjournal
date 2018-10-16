import { Validators } from '@angular/forms';
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
