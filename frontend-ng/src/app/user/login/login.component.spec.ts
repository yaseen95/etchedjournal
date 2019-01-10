import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EtchedUser } from '../../models/etched-user';
import { TestUtils } from '../../utils/test-utils.spec';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { LoginRequest } from '../../services/dtos/login-request';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let loginForm: FormGroup;
    let authSpy: any;
    let emittedEvents: Array<LoginRequest> = [];

    beforeEach(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser']);
        // By default getUser should return null
        authSpy.getUser.and.returnValue(null);

        TestBed.configureTestingModule({
            declarations: [LoginComponent, SpinnerComponent],
            imports: [ReactiveFormsModule],
            providers: [
                {provide: AuthService, useValue: authSpy},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        component.loginEmitter.subscribe(loginReq => emittedEvents.push(loginReq));
        fixture.detectChanges();

        loginForm = component.loginForm;
    });

    it('form valid', () => {
        expect(loginForm.valid).toBeFalsy();

        const passwordControl = loginForm.controls['password'];
        const usernameControl = loginForm.controls['username'];

        // Should only be two controls
        expect(Object.keys(loginForm.controls).length).toEqual(2);

        passwordControl.setValue('password');
        usernameControl.setValue('username');

        expect(loginForm.valid).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(loginForm.valid).toBeFalsy();
    });

    it('form invalid for invalid usernames', () => {
        const passwordControl = loginForm.controls['password'];
        const usernameControl = loginForm.controls['username'];
        // Should only be two controls
        expect(Object.keys(loginForm.controls).length).toEqual(2);

        // Set the password to be valid
        passwordControl.setValue('password');
        expect(passwordControl.valid).toBeTruthy();

        // Establish that it is already invalid
        expect(loginForm.valid).toBeFalsy();
        expect(usernameControl.valid).toBeFalsy();

        const invalidUsernames = [
            '', // empty
            'abcd',  // 4 chars
            'abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijz', // 51 chars
        ];

        for (let username of invalidUsernames) {
            usernameControl.setValue(username);
            expect(usernameControl.valid).toBeFalsy(`"${username}" was expected to be invalid`);
            expect(loginForm.valid).toBeFalsy();
        }
    });

    it('form invalid for invalid passwords', () => {
        const passwordControl = loginForm.controls['password'];
        const usernameControl = loginForm.controls['username'];
        // Should only be two controls
        expect(Object.keys(loginForm.controls).length).toEqual(2);

        // Set the username to a valid value
        usernameControl.setValue('username');
        expect(usernameControl.valid).toBeTruthy();

        // Form and password field should be invalid
        expect(loginForm.valid).toBeFalsy();
        expect(passwordControl.valid).toBeFalsy();

        const invalidPasswords = [
            '', // empty
            'abcdefg',  // 7 chars
            'a'.repeat(257), // 257 chars
        ];

        for (let password of invalidPasswords) {
            passwordControl.setValue(password);
            expect(passwordControl.valid).toBeFalsy(`"${password}" was expected to be invalid`);
            expect(loginForm.valid).toBeFalsy();
        }
    });

    it('submit emits a login event', () => {
        const passwordControl = loginForm.controls['password'];
        const usernameControl = loginForm.controls['username'];

        usernameControl.setValue('submitTest');
        passwordControl.setValue('submitPassword');

        component.onSubmit();

        expect(emittedEvents.length).toEqual(1);
        expect(emittedEvents[0]).toEqual({username: 'submitTest', password: 'submitPassword'});
    });

    it('valid form enables button', () => {
        const loginElementDe: DebugElement = fixture.debugElement;

        const formDe = TestUtils.queryExpectOne(loginElementDe, 'form');
        const usernameInputDe = TestUtils.queryExpectOne(formDe, 'input[type=text]');
        const passwordInputDe = TestUtils.queryExpectOne(formDe, 'input[type=password]');
        const submitBtnDe = TestUtils.queryExpectOne(formDe, 'button[type=submit]');

        // The button should be disabled because the form is invalid
        expect(submitBtnDe.nativeElement.disabled).toBeTruthy();

        // Update the form with valid values
        TestUtils.updateValue(usernameInputDe.nativeElement, 'username');
        TestUtils.updateValue(passwordInputDe.nativeElement, 'password');

        // Refresh the UI
        fixture.detectChanges();

        // The form should be valid and button should be enabled
        expect(submitBtnDe.nativeElement.disabled).toBeFalsy();
    });

    it('button submit triggers onSubmit', () => {
        spyOn(component, 'onSubmit');
        const loginElementDe: DebugElement = fixture.debugElement;

        const formDe = TestUtils.queryExpectOne(loginElementDe, 'form');
        const usernameInputDe = TestUtils.queryExpectOne(formDe, 'input[type=text]');
        const passwordInputDe = TestUtils.queryExpectOne(formDe, 'input[type=password]');
        const submitBtnDe = TestUtils.queryExpectOne(formDe, 'button[type=submit]');

        // Update the form with valid values
        TestUtils.updateValue(usernameInputDe.nativeElement, 'username');
        TestUtils.updateValue(passwordInputDe.nativeElement, 'password');

        // Refresh the UI
        fixture.detectChanges();

        // The form should be valid and button click should trigger a form submit
        (submitBtnDe.nativeElement as HTMLButtonElement).click();
        expect(component.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('logged in user does not show form', () => {
        // When the user is logged in the form displays a <p> saying that the user is logged in
        authSpy.getUser.and.returnValue(TEST_USER);

        // Refresh the UI
        fixture.detectChanges();

        const loginElementDe: DebugElement = fixture.debugElement;
        const paragraphDe = TestUtils.queryExpectOne(loginElementDe, 'p');
        const paragraphEl = paragraphDe.nativeElement as HTMLParagraphElement;

        // Login form should not exist
        const formElements = loginElementDe.queryAll(By.css('form'));
        expect(formElements.length).toEqual(0);

        // Paragraph should display logged in user
        expect(paragraphEl.textContent).toEqual('Logged in as user samsepiol');
    });

    it('displays error when credentials are invalid', () => {
        component.invalidCredentials = true;
        component.username = 'username';
        component.ngOnInit();

        fixture.detectChanges();

        const loginElementDe: DebugElement = fixture.debugElement;
        const paragraphDe = TestUtils.queryExpectOne(loginElementDe, 'p.error-help');
        const paragraphEl = paragraphDe.nativeElement as HTMLParagraphElement;
        expect(paragraphEl.innerText).toEqual('Invalid username or password');
    });

    afterEach(() => {
        emittedEvents = [];
    });
});

const TEST_USER: EtchedUser = {
    id: 'id',
    username: 'samsepiol',
    email: null
};
