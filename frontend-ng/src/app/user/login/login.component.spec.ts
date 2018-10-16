import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EtchedApiService } from '../../services/etched-api.service';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TokenResponse } from '../../services/dtos/token-response';
import { EtchedUser } from '../../models/etched-user';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let loginForm: FormGroup;
    let etchedApiSpy: any;

    beforeEach(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['login', 'getUser']);
        // By default getUser should return null
        etchedApiSpy.getUser.and.returnValue(null);

        TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [
                ReactiveFormsModule,
                HttpClientModule,
            ],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();

        loginForm = component.loginForm;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

    it('submit logs in', () => {
        const passwordControl = loginForm.controls['password'];
        const usernameControl = loginForm.controls['username'];

        usernameControl.setValue('submitTest');
        passwordControl.setValue('submitPassword');

        const loginSpy = etchedApiSpy.login.and.returnValue(of());
        component.onSubmit();

        expect(loginSpy.calls.count()).toEqual(1);
        expect(loginSpy).toHaveBeenCalledWith('submitTest', 'submitPassword');
    });

    it('valid form enables button', () => {
        const loginElementDe: DebugElement = fixture.debugElement;

        const formDe = queryExpectOne(loginElementDe, 'form');
        const usernameInputDe = queryExpectOne(formDe, 'input[type=text]');
        const passwordInputDe = queryExpectOne(formDe, 'input[type=password]');
        const submitBtnDe = queryExpectOne(formDe, 'button[type=submit]');

        // The button should be disabled because the form is invalid
        expect(submitBtnDe.nativeElement.disabled).toBeTruthy();

        // Update the form with valid values
        const usernameInputEl: HTMLInputElement = usernameInputDe.nativeElement;
        const passwordInputEl: HTMLInputElement = passwordInputDe.nativeElement;
        usernameInputEl.value = 'username';
        passwordInputEl.value = 'password';
        usernameInputEl.dispatchEvent(new Event('input'));
        passwordInputEl.dispatchEvent(new Event('input'));

        // Refresh the UI
        fixture.detectChanges();

        // The form should be valid and button should be enabled
        expect(submitBtnDe.nativeElement.disabled).toBeFalsy();
    });

    it('button submit triggers onSubmit', () => {
        spyOn(component, 'onSubmit');
        const loginElementDe: DebugElement = fixture.debugElement;

        const formDe = queryExpectOne(loginElementDe, 'form');
        const usernameInputDe = queryExpectOne(formDe, 'input[type=text]');
        const passwordInputDe = queryExpectOne(formDe, 'input[type=password]');
        const submitBtnDe = queryExpectOne(formDe, 'button[type=submit]');

        // Update the form with valid values
        const usernameInputEl: HTMLInputElement = usernameInputDe.nativeElement;
        const passwordInputEl: HTMLInputElement = passwordInputDe.nativeElement;
        usernameInputEl.value = 'username';
        passwordInputEl.value = 'password';
        usernameInputEl.dispatchEvent(new Event('input'));
        passwordInputEl.dispatchEvent(new Event('input'));

        // Refresh the UI
        fixture.detectChanges();

        // The form should be valid and button click should trigger a form submit
        (submitBtnDe.nativeElement as HTMLButtonElement).click();
        expect(component.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('logged in user does not show form', () => {
        // When the user is logged in the form displays a <p> saying that the user is logged in
        etchedApiSpy.getUser.and.returnValue(TEST_USER);

        // Refresh the UI
        fixture.detectChanges();

        const loginElementDe: DebugElement = fixture.debugElement;
        const paragraphDe = queryExpectOne(loginElementDe, 'p');
        const paragraphEl = paragraphDe.nativeElement as HTMLParagraphElement;

        // Login form should not exist
        const formElements = loginElementDe.queryAll(By.css('form'));
        expect(formElements.length).toEqual(0);

        // Paragraph should display logged in user
        expect(paragraphEl.textContent).toEqual('Logged in as user samsepiol');
    });
});

function queryExpectOne(element: DebugElement, queryExpr: string): DebugElement {
    const matching = element.queryAll(By.css(queryExpr));
    expect(matching.length).toEqual(1);
    return matching[0];
}

const TEST_USER: EtchedUser = {
    id: 'id',
    username: 'samsepiol',
    email: null
};
