import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RegisterContainerComponent } from './register-container.component';
import { EncrypterService } from '../../../services/encrypter.service';
import { RegisterComponent } from '../register.component';
import { ConfigurePassphraseComponent } from '../../configure-passphrase/configure-passphrase.component';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EtchedApiService } from '../../../services/etched-api.service';
import { RegisterRequest } from '../../../services/dtos/register-request';
import { Encrypter, KeyPair } from '../../../services/encrypter';
import { EMPTY, of } from 'rxjs';
import { TestUtils } from '../../../utils/test-utils.spec';
import { CreateKeyPairRequest } from '../../../services/dtos/create-key-pair-request';
import { AuthService, UsernameTakenError } from '../../../services/auth.service';
import TEST_USER = TestUtils.TEST_USER;
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';

describe('RegisterContainerComponent', () => {
    let component: RegisterContainerComponent;
    let fixture: ComponentFixture<RegisterContainerComponent>;
    let etchedApiSpy: any;
    let encrypterSpy: any;
    let encrypterGenKeySpy: any;
    let encrypterSymEncryptSpy: any;
    let encrypterFromSpy: any;
    let authSpy: any;
    let routerSpy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['createKeyPair']);

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt']);
        const encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'register']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        // Spy on the static methods of Encrypter

        // Spy on generate key
        const testKeyPair: KeyPair = {
            publicKeyArmored: 'publicKeyArmored',
            privateKeyArmored: 'privateKeyArmored',
            iterations: 10,
            salt: 'salty',
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

    it('onRegister registers', () => {
        authSpy.register.and.returnValue(Promise.resolve({}));

        // TODO: Handle registration failing e.g. username taken, etc.
        const regReq: RegisterRequest = {username: 'username', password: 'password', email: null};
        component.onRegister(regReq);

        expect(authSpy.register).toHaveBeenCalledTimes(1);
        expect(authSpy.register).toHaveBeenCalledWith('username', 'password');
    });

    it('onPassphraseConfigured e2e', fakeAsync(() => {
        // Mock out the user (the users id is used as part of the user details in the key)
        authSpy.getUser.and.returnValue(TestUtils.TEST_USER);

        // Mock out the public/private keys
        let mockPubKeyPacket = {write: () => new Uint8Array([1, 2, 3, 4])};
        let mockPrivKeyPacket = {write: () => new Uint8Array([5, 6, 7, 8])};

        let encrypter = {
            publicKeys: [{toPacketlist: () => mockPubKeyPacket}],
            privateKey: {toPacketlist: () => mockPrivKeyPacket},
            privateKeyEncrypted: {toPacketlist: () => mockPrivKeyPacket},
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

        // Then upload the public key (as base64 string) and the private key
        expect(etchedApiSpy.createKeyPair).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.createKeyPair).toHaveBeenCalledWith(
            {
                // The public key is base64 encoded byte array of [1, 2, 3, 4]
                publicKey: 'AQIDBA==',
                privateKey: 'BQYHCA==',
                salt: 'salty',
                iterations: 10,
            }
        );

        // Then redirects ot the journals creation page
        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith([EtchedRoutes.JOURNALS_CREATE_PATH]);
        expect(component.registerState).toEqual(component.UPLOADED_KEYS);
    }));

    it('register handles username already taken', fakeAsync(() => {
        authSpy.register.and.returnValue(Promise.reject(new UsernameTakenError()));

        const req: RegisterRequest = {username: 'samsepiol', password: 'password', email: ''};
        component.onRegister(req);

        tick();

        expect(component.registerState).toEqual(component.USERNAME_TAKEN);
        expect(component.username).toEqual('samsepiol');
    }));
});
