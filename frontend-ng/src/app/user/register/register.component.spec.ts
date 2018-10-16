import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EtchedApiService } from '../../services/etched-api.service';
import { of } from 'rxjs';
import TestUtils from '../../utils/test-utils.spec';
import { DebugElement } from '@angular/core';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let registerForm: FormGroup;
    let etchedApiSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['register']);

        TestBed.configureTestingModule({
            declarations: [RegisterComponent],
            imports: [
                ReactiveFormsModule,
            ],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
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

        const registerSpy = etchedApiSpy.register.and.returnValue(of(TestUtils.TEST_USER));
        component.onSubmit();

        expect(registerSpy.calls.count()).toEqual(1);
        expect(registerSpy).toHaveBeenCalledWith('submitTest', 'submitPassword', null);
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
});
