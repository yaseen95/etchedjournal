import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { LogoutComponent } from './logout.component';

describe('LogoutComponent', () => {
    let component: LogoutComponent;
    let fixture: ComponentFixture<LogoutComponent>;
    let routerSpy: any;
    let authSpy: any;

    beforeEach(async(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        authSpy.logout.and.returnValue(Promise.resolve());
        routerSpy.navigate.and.returnValue(Promise.resolve());

        TestBed.configureTestingModule({
            declarations: [
                LogoutComponent,
                SpinnerComponent,
            ],
            providers: [
                {provide: AuthService, useValue: authSpy},
                {provide: Router, useValue: routerSpy},
            ],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LogoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('logs out on init', fakeAsync(() => {
        component.ngOnInit();
        tick(1500);
        // Called twice because logout happens on the initial render and this ngOnInit call
        expect(authSpy.logout).toHaveBeenCalledTimes(2);
        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
    }));

    it('redirects to home page', fakeAsync(() => {
        component.ngOnInit();
        tick(1500);
        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
    }));
});
