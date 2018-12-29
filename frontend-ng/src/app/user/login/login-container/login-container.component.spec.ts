import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginContainerComponent } from './login-container.component';
import { SpinnerComponent } from '../../../utils/spinner/spinner.component';
import { LoginComponent } from '../login.component';
import { EnterPassphraseComponent } from '../../passphrase/enter-passphrase/enter-passphrase.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EtchedApiService } from '../../../services/etched-api.service';
import { TestUtils } from '../../../utils/test-utils.spec';
import { of } from 'rxjs';
import { LoginRequest } from '../../../services/dtos/login-request';
import { Encrypter, IncorrectPassphraseError } from '../../../services/encrypter';
import { OwnerType } from '../../../models/owner-type';
import MOCK_PUB_KEY_BASE_64_STR = TestUtils.MOCK_PUB_KEY_BASE_64_STR;
import MOCK_PRIV_KEY_BASE_64_STR = TestUtils.MOCK_PRIV_KEY_BASE_64_STR;

describe('LoginContainerComponent', () => {
    let component: LoginContainerComponent;
    let fixture: ComponentFixture<LoginContainerComponent>;
    let etchedApiSpy: any;
    let from2Spy: any;

    beforeEach(async(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['login', 'getKeyPairs', 'getUser']);
        etchedApiSpy.getUser.and.returnValue(null);

        from2Spy = spyOn(Encrypter, 'from2');
        from2Spy.and.returnValue(Promise.resolve({}));

        TestBed.configureTestingModule({
            declarations: [
                LoginContainerComponent,
                SpinnerComponent,
                LoginComponent,
                EnterPassphraseComponent,
            ],
            imports: [ReactiveFormsModule],
            providers: [
                {provide: EtchedApiService, useValue: etchedApiSpy},
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('initial state is NOT_LOGGED_IN', () => {
        expect(component.loginState).toEqual('NOT_LOGGED_IN');
    });

    it('passphrase is not invalid on initial state', () => {
        expect(component.passphraseIncorrect).toBeFalsy();
    });

    it('onLogin logs in and downloads keys', fakeAsync(() => {
        etchedApiSpy.login.and.returnValue(of({}));
        const keyPairs = [
            {publicKey: MOCK_PUB_KEY_BASE_64_STR, privateKey: MOCK_PRIV_KEY_BASE_64_STR}
        ];
        etchedApiSpy.getKeyPairs.and.returnValue(of(keyPairs));

        // Preconditions
        expect(component.loginState).toEqual(component.NOT_LOGGED_IN);

        const req: LoginRequest = {username: 'samsepiol', password: 'cisco'};
        component.onLogin(req);

        tick();

        expect(etchedApiSpy.login).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.login).toHaveBeenCalledWith('samsepiol', 'cisco');

        expect(etchedApiSpy.getKeyPairs).toHaveBeenCalledTimes(1);
        expect(etchedApiSpy.login).toHaveBeenCalledBefore(etchedApiSpy.getKeyPairs);

        expect(component.loginState).toEqual(component.ENTERING_PASSPHRASE);
        expect(component.keyPair as any).toEqual(keyPairs[0]);
    }));

    it('multiple key pairs returned throws an error', fakeAsync(() => {
        etchedApiSpy.login.and.returnValue(of({}));
        const keyPairs = [
            // Return two key pairs
            {publicKey: MOCK_PUB_KEY_BASE_64_STR, privateKey: MOCK_PRIV_KEY_BASE_64_STR},
            {publicKey: MOCK_PUB_KEY_BASE_64_STR, privateKey: MOCK_PRIV_KEY_BASE_64_STR},
        ];
        etchedApiSpy.getKeyPairs.and.returnValue(of(keyPairs));

        const req: LoginRequest = {username: 'samsepiol', password: 'cisco'};
        try {
            component.onLogin(req);
            tick();
            fail('Expected login to throw');
        } catch (e) {
            expect(e.message).toEqual('Expected only one key but got 2 keys');
        }
    }));

    it('should throw an error if zero key pairs returned', fakeAsync(() => {
        // This test will break when we configure the login container to create the key pair if
        // one does not exist.
        // If a user registers but doesn't create the key, the login flow should create one.
        etchedApiSpy.login.and.returnValue(of({}));
        // return zero keys
        const keyPairs = [];
        etchedApiSpy.getKeyPairs.and.returnValue(of(keyPairs));

        const req: LoginRequest = {username: 'samsepiol', password: 'cisco'};
        try {
            component.onLogin(req);
            tick();
            fail('Expected login to throw');
        } catch (e) {
            expect(e.message).toEqual('Expected only one key but got 0 keys');
        }
    }));

    it('should decrypt private key when passphrase is entered', fakeAsync(() => {
        component.keyPair = {
            privateKey: 'encrypted private key',
            publicKey: 'public key',
            id: 'kpId',
            salt: 'salt',
            iterations: 1,
            owner: 'owner',
            ownerType: OwnerType.USER,
            timestamp: 0,
        };

        spyOn(component, 'decryptKeyPair').and.callThrough();

        component.onPassphraseConfigured('super secure passphrase');
        tick();

        expect(component.decryptKeyPair).toHaveBeenCalledTimes(1);
        expect(component.decryptKeyPair).toHaveBeenCalledWith('super secure passphrase');

        expect(from2Spy).toHaveBeenCalledTimes(1);
        expect(from2Spy).toHaveBeenCalledWith('encrypted private key', 'public key', 'super' +
            ' secure passphrase', 'kpId', 'salt', 1);

        expect(component.loginState).toEqual(component.DECRYPTED_KEYS);
        expect(component.passphraseIncorrect).toBeFalsy();
    }));

    it('should handle error when passphrase is incorrect', fakeAsync(() => {
        component.keyPair = {
            privateKey: 'encrypted private key',
            publicKey: 'public key',
        } as any;

        from2Spy.and.returnValue(Promise.reject(new IncorrectPassphraseError()));

        component.onPassphraseConfigured('incorrect passphrase');
        tick();

        // Passphrase should be incorrect
        expect(component.passphraseIncorrect).toBeTruthy();
        // Should still be in the entering passphrase state
        expect(component.loginState).toEqual(component.ENTERING_PASSPHRASE);
    }));

    // TODO: Add e2e test that checks that enter passphrase form displays error when the
    //  passphrase is incorrect
});
