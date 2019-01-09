import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EtchedUser } from '../../models/etched-user';
import { PASSWORD_VALIDATORS, USERNAME_VALIDATORS } from '../form-utils';
import { LoginRequest } from '../../services/dtos/login-request';
import { AuthService } from '../../services/auth.service';

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

    @Output()
    loginEmitter: EventEmitter<LoginRequest> = new EventEmitter();

    constructor(private fb: FormBuilder,
                private authService: AuthService) {
        this.inFlight = false;
    }

    ngOnInit() {
    }

    onSubmit() {
        const event: LoginRequest = {
            username: this.loginForm.value.username,
            password: this.loginForm.value.password
        };
        this.loginEmitter.emit(event);
    }

    get user(): EtchedUser | null {
        return this.authService.getUser();
    }
}
