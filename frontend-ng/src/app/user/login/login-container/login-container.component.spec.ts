import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginContainerComponent } from './login-container.component';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { LoginComponent } from '../login.component';
import { EnterPassphraseComponent } from '../../passphrase/enter-passphrase/enter-passphrase.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EtchedApiService } from '../../../services/etched-api.service';
import { of } from 'rxjs';
import { LoginRequest } from '../../../services/dtos/login-request';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
});
