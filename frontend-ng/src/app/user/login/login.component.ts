import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../../services/etched-api.service';
import { FormBuilder } from '@angular/forms';
import { EtchedUser } from '../../models/etched-user';
import { PASSWORD_VALIDATORS, USERNAME_VALIDATORS } from '../form-utils';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginForm = this.fb.group({
        username: ['', USERNAME_VALIDATORS],
        password: ['', PASSWORD_VALIDATORS],
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
