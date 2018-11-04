import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../../services/etched-api.service';
import { FormBuilder } from '@angular/forms';
import { EtchedUser } from '../../models/etched-user';
import { PASSWORD_VALIDATORS, USERNAME_VALIDATORS } from '../form-utils';
import { EncrypterService } from '../../services/encrypter.service';
import { Encrypter, TEST_KEY_PAIR } from '../../services/encrypter';

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

    /** login request is in flight */
    inFlight: boolean;

    constructor(private fb: FormBuilder,
                private etchedApi: EtchedApiService,
                private encrypterService: EncrypterService) {
        this.inFlight = false;
    }

    ngOnInit() {
        // TODO: Create a separate component for downloading the key and entering the passphrase
        Encrypter.from(TEST_KEY_PAIR, 'passphrase')
            .then(encrypter => this.encrypterService.encrypter = encrypter);
    }

    onSubmit() {
        const {username, password} = this.loginForm.value;
        console.info(`logging in ${username}`);
        this.inFlight = true;
        this.etchedApi.login(username, password)
            // Do nothing with this subscription
            .subscribe(() => this.inFlight = false);
    }

    get user(): EtchedUser | null {
        return this.etchedApi.getUser();
    }

    showSpinner(): boolean {
        return this.inFlight || this.encrypterService.encrypter === null;
    }
}
