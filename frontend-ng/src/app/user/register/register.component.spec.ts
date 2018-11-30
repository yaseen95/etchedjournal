import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { RegisterRequest } from '../../services/dtos/register-request';
import { TestUtils } from '../../utils/test-utils.spec';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let registerForm: FormGroup;
    let emittedEvents: Array<RegisterRequest>;

    beforeEach(async(() => {
        emittedEvents = [];

        TestBed.configureTestingModule({
            declarations: [RegisterComponent, SpinnerComponent],
            imports: [
                ReactiveFormsModule,
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        component.ngOnInit();
        fixture.detectChanges();

        registerForm = component.registerForm;

        component.registerEmitter.subscribe(req => emittedEvents.push(req));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('form valid', () => {
        const passwordControl = registerForm.controls['password'];
        const usernameControl = registerForm.controls['username'];

        // Should only be two controls
        expect(Object.keys(registerForm.controls).length).toEqual(2);

        passwordControl.setValue('password');
        usernameControl.setValue('username');

        expect(registerForm.valid).toBeTruthy();
    });

    it('form invalid when empty', () => {
        expect(registerForm.valid).toBeFalsy();
    });

    it('submit registers', () => {
        const passwordControl = registerForm.controls['password'];
        const usernameControl = registerForm.controls['username'];

        usernameControl.setValue('submitTest');
        passwordControl.setValue('submitPassword');

        component.onSubmit();

        expect(emittedEvents.length).toEqual(1);
        const regReq = emittedEvents[0];
        expect(regReq).toEqual({email: null, password: 'submitPassword', username: 'submitTest'});
    });

    it('valid form enables button', () => {
        const registerElementDe: DebugElement = fixture.debugElement;

        const formDe = TestUtils.queryExpectOne(registerElementDe, 'form');
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

    afterEach(() => {
        emittedEvents = [];
    })
});
