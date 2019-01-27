import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    AuthService,
    InvalidCredentialsError,
    UserNotFoundError
} from '../../../services/auth.service';
import { LoginRequest } from '../../../services/dtos/login-request';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { EnterPassphraseComponent } from '../../passphrase/enter-passphrase/enter-passphrase.component';
import { LoginComponent } from '../login.component';
import { LoginContainerComponent } from './login-container.component';

describe('LoginContainerComponent', () => {
    let component: LoginContainerComponent;
    let fixture: ComponentFixture<LoginContainerComponent>;
    let authSpy: any;
    let routerSpy: any;

    beforeEach(async(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['login', 'getUser']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        authSpy.getUser.and.returnValue(null);

        TestBed.configureTestingModule({
            declarations: [
                LoginContainerComponent,
                SpinnerComponent,
                LoginComponent,
                EnterPassphraseComponent,
            ],
            imports: [
                ReactiveFormsModule,
            ],
            providers: [
                {provide: AuthService, useValue: authSpy},
                {provide: Router, useValue: routerSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('initial state is NOT_LOGGED_IN', () => {
        expect(component.loginState).toEqual(component.NOT_LOGGED_IN);
    });

    it('logging in redirects to enter passphrase', fakeAsync(() => {
        authSpy.login.and.returnValue(Promise.resolve({}));

        const req: LoginRequest = {username: 'samsepiol', password: 'cisco'};
        component.onLogin(req);

        tick();

        expect(authSpy.login).toHaveBeenCalledTimes(1);
        expect(authSpy.login).toHaveBeenCalledWith('samsepiol', 'cisco');

        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['enter-passphrase']);
    }));

    it('InvalidCredentialsError is handled', fakeAsync(() => {
        // Preconditions
        expect(component.loginState).not.toEqual(component.INVALID_CREDENTIALS);
        expect(component.username).not.toEqual('samsepiol');

        authSpy.login.and.returnValue(Promise.reject(new InvalidCredentialsError()));

        const req: LoginRequest = {username: 'samsepiol', password: 'cisco'};
        component.onLogin(req);

        tick();

        expect(component.loginState).toEqual(component.INVALID_CREDENTIALS);
        expect(component.username).toEqual('samsepiol');
    }));

    it('UserNotFoundError is handled', fakeAsync(() => {
        // Preconditions
        expect(component.loginState).not.toEqual(component.INVALID_CREDENTIALS);
        expect(component.username).not.toEqual('samsepiol');

        authSpy.login.and.returnValue(Promise.reject(new UserNotFoundError()));

        const req: LoginRequest = {username: 'samsepiol', password: 'cisco'};
        component.onLogin(req);

        tick();

        expect(component.loginState).toEqual(component.INVALID_CREDENTIALS);
        expect(component.username).toEqual('samsepiol');
    }));
});
