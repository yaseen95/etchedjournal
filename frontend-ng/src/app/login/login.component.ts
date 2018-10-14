import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../services/etched-api.service';
import { FormBuilder, Validators } from '@angular/forms';
import { EtchedUser } from '../models/etched-user';

const USERNAME_MIN_LENGTH = 5;
const USERNAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 256;

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginForm = this.fb.group({
        username: ['', Validators.compose([
            Validators.required,
            Validators.minLength(USERNAME_MIN_LENGTH),
            Validators.maxLength(USERNAME_MAX_LENGTH),
        ])],
        password: ['', Validators.compose([
            Validators.required,
            Validators.minLength(PASSWORD_MIN_LENGTH),
            Validators.maxLength(PASSWORD_MAX_LENGTH),
        ])],
    });

    constructor(private fb: FormBuilder,
                private etchedApi: EtchedApiService) {
    }

    ngOnInit() {
    }

    onSubmit() {
        const {username, password} = this.loginForm.value;
        console.info(`logging in ${username}`);
        this.etchedApi.login(username, password)
            .subscribe(() => {
                this.etchedApi.self()
                    .subscribe(() => {
                        // Do nothing with this subscription
                    });
            });
    }

    get user(): EtchedUser | null {
        return this.etchedApi.getUser();
    }
}
