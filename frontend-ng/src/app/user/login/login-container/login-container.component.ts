import { Component, OnInit } from '@angular/core';
import { EncrypterService } from '../../../services/encrypter.service';
import { LoginRequest } from '../../../services/dtos/login-request';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';
import {
    AuthService,
    InvalidCredentialsError,
    UserNotFoundError
} from '../../../services/auth.service';

@Component({
    selector: 'app-login-container',
    templateUrl: './login-container.component.html',
    styleUrls: ['./login-container.component.css']
})
export class LoginContainerComponent implements OnInit {

    NOT_LOGGED_IN = 'NOT_LOGGED_IN';
    LOGGING_IN = 'LOGGING_IN';
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

    /** Current state of login process */
    loginState: string;

    /**
     * If a login fails e.g. due to invalid password, we store the username in this field and
     * pass it to the LoginComponent to allow a user to try again without reentering their
     * username.
     */
    username?: string;

    constructor(private encrypterService: EncrypterService,
                private authService: AuthService,
                private router: Router) {
        this.loginState = this.NOT_LOGGED_IN;
    }

    ngOnInit() {
    }

    /**
     * Responds to login requests emitted by {@link LoginComponent.loginEmitter}
     * @param loginRequest
     */
    onLogin(loginRequest: LoginRequest) {
        this.loginState = this.LOGGING_IN;
        this.authService.login(loginRequest.username, loginRequest.password)
            .then(() => {
                // noinspection JSIgnoredPromiseFromCall
                this.router.navigate([EtchedRoutes.ENTER_PASSPHRASE_PATH]);
            })
            .catch(error => {
                if ([InvalidCredentialsError.MESSAGE, UserNotFoundError.MESSAGE].includes(error.message)) {
                    this.loginState = this.INVALID_CREDENTIALS;
                }
                // TODO: Figure out how to surface error when it is not one of the above
                this.username = loginRequest.username;
            });
    }
}
