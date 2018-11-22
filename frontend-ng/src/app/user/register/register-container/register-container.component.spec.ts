import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RegisterContainerComponent } from './register-container.component';
import { EncrypterService } from '../../../services/encrypter.service';
import { RegisterComponent } from '../register.component';
import { ConfigurePassphraseComponent } from '../../configure-passphrase/configure-passphrase.component';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EtchedApiService } from '../../../services/etched-api.service';
import TestUtils from '../../../utils/test-utils.spec';
import { RegisterRequest } from '../../../services/dtos/register-request';
import { Encrypter } from '../../../services/encrypter';
import { EMPTY, of } from 'rxjs';

describe('RegisterContainerComponent', () => {
    let component: RegisterContainerComponent;
    let fixture: ComponentFixture<RegisterContainerComponent>;
    let etchedApiSpy: any;
    let encrypterSpy: any;
    let encrypterGenKeySpy: any;
    let encrypterSymEncryptSpy: any;
    let encrypterFromSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['register', 'login', 'createKeyPair', 'getUser']);

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt']);
        const encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        // Spy on the static methods of Encrypter

        // Spy on generate key
        const testKeyPair = {
            publicKeyArmored: 'publicKeyArmored',
            privateKeyArmored: 'privateKeyArmored',
            key: null,
        };
        encrypterGenKeySpy = spyOn(Encrypter, 'generateKey');
        encrypterGenKeySpy.and.returnValue(Promise.resolve(testKeyPair));

        // Spy on the symmetric encrypt method
        encrypterSymEncryptSpy = spyOn(Encrypter, 'symmetricEncrypt');
        encrypterSymEncryptSpy.and.returnValue(Promise.resolve('symmetrically encrypted'));

        // Spy on the from constructor
        encrypterFromSpy = spyOn(Encrypter, 'from');
        encrypterFromSpy.and.returnValue(Promise.resolve(encrypterSpy));

        TestBed.configureTestingModule({
            declarations: [
                RegisterContainerComponent,
                SpinnerComponent,
                RegisterComponent,
                ConfigurePassphraseComponent,
            ],
            imports: [ReactiveFormsModule],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
                {provide: EncrypterService, useValue: encrypterService},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('displays register when state is NOT_REGISTERED', () => {
        component.registerState = component.NOT_REGISTERED;
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'register');
    });

    it('displays register on load', () => {
        // Should display the register form by default
        TestUtils.queryExpectOne(fixture.debugElement, 'register');
    });

    it('displays registering spinner when state is REGISTERING', () => {
        component.registerState = component.REGISTERING;
        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Registering');
    });

    it('displays passphrase form when state is ENTERING_PASSPHRASE', () => {
        component.registerState = component.ENTERING_PASSPHRASE;
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'app-configure-passphrase');
    });

    it('displays generating keys spinner when state is CREATING_KEYS', () => {
        component.registerState = component.CREATING_KEYS;
        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Generating encryption keys');
    });

    it('displays uploading keys spinner when state is UPLOADING_KEYS', () => {
        component.registerState = component.UPLOADING_KEYS;
        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Uploading keys');
    });

    it('displays keys uploaded when state is UPLOADED_KEYS', () => {
        component.registerState = component.UPLOADED_KEYS;
        fixture.detectChanges();
        const h3De = TestUtils.queryExpectOne(fixture.debugElement, 'h3');
        expect(h3De.nativeElement.innerText).toEqual('Finished registration');
    });

    it('onRegister registers and logs in', fakeAsync(() => {
        const regReq: RegisterRequest = {username: 'username', password: 'password', email: null};

        // TODO: Handle registration failing e.g. username taken, etc.
        etchedApiSpy.register.and.returnValue(of({}));
        etchedApiSpy.login.and.returnValue(of({}));

        component.onRegister(regReq);

        tick();

        expect(etchedApiSpy.register).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.register).toHaveBeenCalledWith('username', 'password', null);
        expect(etchedApiSpy.login).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.login).toHaveBeenCalledWith('username', 'password');
    }));

    it('onRegister updates state and stores password for later', fakeAsync(() => {
        // Password should not be defined
        expect(component.password).toBeUndefined();

        // Register
        const regReq: RegisterRequest = {username: 'username', password: 'password', email: null};
        etchedApiSpy.register.and.returnValue(EMPTY);
        component.onRegister(regReq);

        expect(component.password).toEqual('password');
        expect(component.registerState).toEqual(component.REGISTERING);
    }));

    it('onPassphraseConfigured e2e', fakeAsync(() => {
        // onPassphraseConfigured does a few things
        // 1. Create a new keypair
        // 2. Encrypt that keypair using the password
        // 3. Upload the keypair

        component.password = 'login password';

        // Mock out the user (the users id is used as part of the user details in the key)
        etchedApiSpy.getUser.and.returnValue(TestUtils.TEST_USER);

        // Mock out the public/private keys
        let mockPubKeyPacket = {write: () => new Uint8Array([1, 2, 3, 4])};
        let mockPrivKeyPacket = {write: () => new Uint8Array([5, 6, 7, 8])};

        let encrypter = {
            publicKeys: [{toPacketlist: () => mockPubKeyPacket}],
            privateKey: {toPacketlist: () => mockPrivKeyPacket},
        };
        encrypterFromSpy.and.returnValue(Promise.resolve(encrypter));

        // Mock out the create key pair response
        etchedApiSpy.createKeyPair.and.returnValue(of({}));

        component.onPassphraseConfigured('passphrase');

        tick();

        // Should generate the key
        expect(encrypterGenKeySpy).toHaveBeenCalledTimes(1);
        expect(encrypterGenKeySpy).toHaveBeenCalledWith('passphrase', '123-456');

        // Then instantiate an encrypter from the generated the keys
        expect(encrypterFromSpy).toHaveBeenCalledTimes(1);

        // Symmetrically encrypt the private key using the login password
        expect(encrypterSymEncryptSpy).toHaveBeenCalledTimes(1);
        expect(encrypterSymEncryptSpy).toHaveBeenCalledWith('BQYHCA==', 'login password');

        // Then upload the public key (as base64 string) and the encrypted private key
        expect(etchedApiSpy.createKeyPair).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.createKeyPair).toHaveBeenCalledWith(
            // The public key is base64 encoded byte array of [1, 2, 3, 4]
            'AQIDBA==',
            'symmetrically encrypted'
        );

        expect(component.registerState).toEqual(component.UPLOADED_KEYS);
    }));
});
