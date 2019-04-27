import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { EtchedRoutes } from '../../app-routing-utils';
import { AuthService } from '../../services/auth.service';
import { Encrypter, KeyPair } from '../../services/encrypter';
import { EncrypterService } from '../../services/encrypter.service';
import { FakeEncrypterService } from '../../services/fakes.service.spec';
import { KeyPairService } from '../../services/key-pair.service';
import { ConfigurePassphraseComponent } from '../../user/configure-passphrase/configure-passphrase.component';
import { SpinnerComponent } from '../../utils/spinner/spinner.component';
import { TestUtils } from '../../utils/test-utils.spec';
import { GenerateContainerComponent } from './generate-container.component';

describe('GenerateContainerComponent', () => {
    let component: GenerateContainerComponent;
    let fixture: ComponentFixture<GenerateContainerComponent>;
    let keyPairServiceSpy: any;
    let encrypterSpy: any;
    let encrypterGenKeySpy: any;
    let encrypterSymEncryptSpy: any;
    let encrypterFromSpy: any;
    let authSpy: any;
    let routerSpy: any;

    beforeEach(async () => {
        keyPairServiceSpy = jasmine.createSpyObj('KeyPairService', ['createKeyPair']);

        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt']);
        const encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = encrypterSpy;

        authSpy = jasmine.createSpyObj('AuthService', ['getUser', 'register']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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
                GenerateContainerComponent,
                SpinnerComponent,
                ConfigurePassphraseComponent,
            ],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: KeyPairService, useValue: keyPairServiceSpy },
                { provide: EncrypterService, useValue: encrypterService },
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GenerateContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('displays passphrase form when state is REGISTERED', () => {
        component.state = component.ENTERING_PASSPHRASE;
        fixture.detectChanges();
        TestUtils.queryExpectOne(fixture.debugElement, 'app-configure-passphrase');
    });

    it('displays generating keys spinner when state is CREATING_KEYS', () => {
        component.state = component.CREATING_KEYS;
        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Generating encryption keys');
    });

    it('displays uploading keys spinner when state is UPLOADING_KEYS', () => {
        component.state = component.UPLOADING_KEYS;
        fixture.detectChanges();
        const spinnerDe = TestUtils.queryExpectOne(fixture.debugElement, 'app-spinner');
        expect(spinnerDe.nativeElement.innerText).toEqual('Uploading keys');
    });

    it('onPassphraseConfigured e2e', fakeAsync(() => {
        // Mock out the user (the users id is used as part of the user details in the key)
        authSpy.getUser.and.returnValue(TestUtils.TEST_USER);

        // Mock out the public/private keys
        const mockPubKeyPacket = { write: () => new Uint8Array([1, 2, 3, 4]) };
        const mockPrivKeyPacket = { write: () => new Uint8Array([5, 6, 7, 8]) };

        const encrypter = {
            publicKeys: [{ toPacketlist: () => mockPubKeyPacket }],
            privateKey: { toPacketlist: () => mockPrivKeyPacket },
            privateKeyEncrypted: { toPacketlist: () => mockPrivKeyPacket },
        };
        encrypterFromSpy.and.returnValue(Promise.resolve(encrypter));

        // Mock out the create key pair response
        keyPairServiceSpy.createKeyPair.and.returnValue(of({}));

        component.onPassphraseConfigured('passphrase');

        tick();

        // Should generate the key
        expect(encrypterGenKeySpy).toHaveBeenCalledTimes(1);
        expect(encrypterGenKeySpy).toHaveBeenCalledWith('passphrase', '123-456');

        // Then instantiate an encrypter from the generated the keys
        expect(encrypterFromSpy).toHaveBeenCalledTimes(1);

        // Then upload the public key (as base64 string) and the private key
        expect(keyPairServiceSpy.createKeyPair).toHaveBeenCalledTimes(1);
        expect(keyPairServiceSpy.createKeyPair).toHaveBeenCalledWith({
            // The public key is base64 encoded byte array of [1, 2, 3, 4]
            publicKey: 'AQIDBA==',
            privateKey: 'BQYHCA==',
            salt: 'salty',
            iterations: 10,
        });

        // Then redirects ot the journals creation page
        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith([EtchedRoutes.JOURNALS_CREATE_PATH]);
        expect(component.state).toEqual(component.UPLOADED_KEYS);
    }));
});
