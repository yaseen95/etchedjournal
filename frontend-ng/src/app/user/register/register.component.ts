import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EMAIL_VALIDATORS, PASSWORD_VALIDATORS, USERNAME_VALIDATORS } from '../form-utils';
import { EtchedApiService } from '../../services/etched-api.service';

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

    constructor(private fb: FormBuilder,
                private etchedApi: EtchedApiService) {
    }

    ngOnInit() {
    }

    onSubmit() {
        console.info(this.registerForm.value);
        let {username, password} = this.registerForm.value;
        // if (email === undefined || email.trim() === '') {
        //     console.info('Registering without an email');
        //     email = null;
        // }
        // TODO: Allow optional emails
        this.etchedApi.register(
            username,
            password,
            null
        )
            .subscribe(u => {
                console.info(`Registered ${JSON.stringify(u)}`);
            });
    }
}
