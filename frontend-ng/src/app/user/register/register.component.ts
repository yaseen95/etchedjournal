import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PASSWORD_VALIDATORS, USERNAME_VALIDATORS } from '../form-utils';
import { RegisterRequest } from '../../services/dtos/register-request';

@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

    registerForm = this.fb.group({
        username: ['', USERNAME_VALIDATORS],
        password: ['', PASSWORD_VALIDATORS],
        // email: ['', EMAIL_VALIDATORS],
    });

    @Output()
    registerEmitter: EventEmitter<RegisterRequest> = new EventEmitter();

    constructor(private fb: FormBuilder) {
    }

    ngOnInit() {
    }

    onSubmit() {
        let {username, password} = this.registerForm.value;
        // if (email === undefined || email.trim() === '') {
        //     console.info('Registering without an email');
        //     email = null;
        // }
        // TODO: Allow optional emails

        const registerRequest: RegisterRequest = {
            username,
            password,
            email: null,
        };
        this.registerEmitter.emit(registerRequest);
    }
}
