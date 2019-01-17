import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';
import { AuthService, UsernameTakenError } from '../../../services/auth.service';
import { RegisterRequest } from '../../../services/dtos/register-request';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { TestUtils } from '../../../utils/test-utils.spec';
import { RegisterComponent } from '../register.component';
import { RegisterContainerComponent } from './register-container.component';

describe('RegisterContainerComponent', () => {
    let component: RegisterContainerComponent;
    let fixture: ComponentFixture<RegisterContainerComponent>;
    let authSpy: any;
    let routerSpy: any;

    beforeEach(async(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'register']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            declarations: [
                RegisterContainerComponent,
                SpinnerComponent,
                RegisterComponent,
            ],
            imports: [ReactiveFormsModule],
            providers: [
                {provide: AuthService, useValue: authSpy},
                {provide: Router, useValue: routerSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('displays register when state is NOT_REGISTERED', () => {
        component.state = component.NOT_REGISTERED;
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'app-register');
    });

    it('displays register on load', () => {
        // Should display the register form by default
        TestUtils.queryExpectOne(fixture.debugElement, 'app-register');
    });

    it('displays registering spinner when state is REGISTERING', () => {
        component.state = component.REGISTERING;
        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Registering');
    });

    it('onRegister registers', () => {
        authSpy.register.and.returnValue(Promise.resolve({}));

        // TODO: Handle registration failing e.g. username taken, etc.
        const regReq: RegisterRequest = {username: 'username', password: 'password', email: null};
        component.onRegister(regReq);

        expect(authSpy.register).toHaveBeenCalledTimes(1);
        expect(authSpy.register).toHaveBeenCalledWith('username', 'password');
    });

    it('onRegister redirects to keys/generate', fakeAsync(() => {
        authSpy.register.and.returnValue(Promise.resolve({}));

        const regReq: RegisterRequest = {username: 'username', password: 'password', email: null};
        component.onRegister(regReq);

        tick();

        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith([EtchedRoutes.KEYS_GENERATE_PATH]);
    }));

    it('register handles username already taken', fakeAsync(() => {
        authSpy.register.and.returnValue(Promise.reject(new UsernameTakenError()));

        const req: RegisterRequest = {username: 'samsepiol', password: 'password', email: ''};
        component.onRegister(req);

        tick();

        expect(component.state).toEqual(component.USERNAME_TAKEN);
        expect(component.username).toEqual('samsepiol');
    }));
});
