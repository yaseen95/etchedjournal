import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { NavComponent } from './nav.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TestUtils } from '../utils/test-utils.spec';
import TEST_USER = TestUtils.TEST_USER;

describe('NavComponent', () => {
    let component: NavComponent;
    let fixture: ComponentFixture<NavComponent>;
    let authSpy: any;

    beforeEach(async(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'logout']);

        TestBed.configureTestingModule({
            declarations: [NavComponent],
            providers: [
                {provide: AuthService, useValue: authSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('toggling burger menu active updates classes', () => {
        // Preconditions - not active when `burgerIsActive` is false.
        expect(component.burgerIsActive).toBeFalsy();
        const burgerMenuBtnDe = TestUtils.queryExpectOne(fixture.debugElement, 'a.navbar-burger');
        const navBarMenuDe = TestUtils.queryExpectOne(fixture.debugElement, 'div.navbar-menu');
        expect(burgerMenuBtnDe.classes['is-active']).toBeFalsy();
        expect(navBarMenuDe.classes['is-active']).toBeFalsy();

        component.toggleBurgerMenu();
        fixture.detectChanges();

        expect(burgerMenuBtnDe.classes['is-active']).toBeTruthy();
        expect(navBarMenuDe.classes['is-active']).toBeTruthy();
        expect(component.burgerIsActive).toBeTruthy();
    });

    it('displays register and login buttons when not logged in', () => {
        authSpy.getUser.and.returnValue(null);
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, '#register-btn');
        TestUtils.queryExpectOne(fixture.debugElement, '#login-btn');
        // does not display logout button
        TestUtils.queryExpectNone(fixture.debugElement, '#logout-btn');
    });

    it('displays logout button when logged in', () => {
        authSpy.getUser.and.returnValue(TEST_USER);
        fixture.detectChanges();

        TestUtils.queryExpectOne(fixture.debugElement, '#logout-btn');
        // does not display login and register buttons
        TestUtils.queryExpectNone(fixture.debugElement, '#register-btn');
        TestUtils.queryExpectNone(fixture.debugElement, '#login-btn');
    });
});
