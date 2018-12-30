import { Component, OnInit } from '@angular/core';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchedApiService } from '../../../services/etched-api.service';
import { LoginRequest } from '../../../services/dtos/login-request';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';

@Component({
    selector: 'app-login-container',
    templateUrl: './login-container.component.html',
    styleUrls: ['./login-container.component.css']
})
export class LoginContainerComponent implements OnInit {

    NOT_LOGGED_IN = 'NOT_LOGGED_IN';
    LOGGING_IN = 'LOGGING_IN';

    /** Current state of login process */
    loginState: string;

    constructor(private encrypterService: EncrypterService,
                private etchedApiService: EtchedApiService,
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
        this.etchedApiService.login(loginRequest.username, loginRequest.password)
            .subscribe(u => {
                this.router.navigate([EtchedRoutes.ENTER_PASSPHRASE_PATH]);
            });
    }
}
