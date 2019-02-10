import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { EtchedUser } from '../../models/etched-user';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../services/dtos/login-request';
import { PASSWORD_VALIDATORS, USERNAME_VALIDATORS } from '../form-utils';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    public loginForm = this.fb.group({
        username: ['', USERNAME_VALIDATORS],
        password: ['', PASSWORD_VALIDATORS],
    });

    /** login request is in flight */
    public inFlight: boolean;

    @Input()
    public invalidCredentials?: boolean;

    @Input()
    public username?: string;

    @Output()
    public loginEmitter: EventEmitter<LoginRequest> = new EventEmitter();

    constructor(private fb: FormBuilder, private authService: AuthService) {
        this.inFlight = false;
    }

    public ngOnInit() {
        if (this.username !== undefined) {
            this.loginForm.controls.username.setValue(this.username);
            this.loginForm.controls.password.setValue('');
        }
    }

    public onSubmit() {
        const event: LoginRequest = {
            username: this.loginForm.value.username,
            password: this.loginForm.value.password,
        };
        this.loginEmitter.emit(event);
    }

    get user(): EtchedUser | null {
        return this.authService.getUser();
    }
}
