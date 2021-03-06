import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { EtchedRoutes } from '../../../../app-routing-utils';
import { Encrypter, IncorrectPassphraseError } from '../../../../services/encrypter';
import { EncrypterService } from '../../../../services/encrypter.service';
import { FakeEncrypterService } from '../../../../services/fakes.service.spec';
import { KeyPairService } from '../../../../services/key-pair.service';
import { OwnerType } from '../../../../services/models/owner-type';
import { SpinnerComponent } from '../../../../utils/spinner/spinner.component';
import { TestUtils } from '../../../../utils/test-utils.spec';
import { EnterPassphraseComponent } from '../enter-passphrase.component';
import { EnterPassphraseContainerComponent } from './enter-passphrase-container.component';
import MOCK_PRIV_KEY_BASE_64_STR = TestUtils.MOCK_PRIV_KEY_BASE_64_STR;
import MOCK_PUB_KEY_BASE_64_STR = TestUtils.MOCK_PUB_KEY_BASE_64_STR;

describe('EnterPassphraseContainerComponent', () => {
    let component: EnterPassphraseContainerComponent;
    let fixture: ComponentFixture<EnterPassphraseContainerComponent>;
    let keyPairServiceSpy: any;
    let from2Spy: any;
    let routerSpy: any;
    let encService: FakeEncrypterService;

    const testKeyPair = {
        publicKey: MOCK_PUB_KEY_BASE_64_STR,
        privateKey: MOCK_PRIV_KEY_BASE_64_STR,
    };

    beforeEach(async(() => {
        keyPairServiceSpy = jasmine.createSpyObj('KeyPairService', ['getKeyPairs']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        keyPairServiceSpy.getKeyPairs.and.returnValue(of([testKeyPair]));

        from2Spy = spyOn(Encrypter, 'from2');
        from2Spy.and.returnValue(Promise.resolve({}));

        encService = new FakeEncrypterService();

        // noinspection JSIgnoredPromiseFromCall
        TestBed.configureTestingModule({
            declarations: [
                EnterPassphraseContainerComponent,
                SpinnerComponent,
                EnterPassphraseComponent,
            ],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: KeyPairService, useValue: keyPairServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { queryParamMap: convertToParamMap({ next: 'nextRoute' }) },
                    },
                },
                { provide: EncrypterService, useValue: encService },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EnterPassphraseContainerComponent);
        component = fixture.componentInstance;
        spyOn(component, 'ngOnInit').and.callThrough();
        fixture.detectChanges();
    });

    it('passphrase is not invalid on initial state', () => {
        expect(component.passphraseIncorrect).toBeFalsy();
    });

    it('downloads keys on init', fakeAsync(() => {
        tick();

        expect(component.ngOnInit).toHaveBeenCalledTimes(1);
        expect(keyPairServiceSpy.getKeyPairs).toHaveBeenCalledTimes(1);

        expect(component.state).toEqual(component.ENTERING_PASSPHRASE);
        expect(component.keyPair as any).toEqual(testKeyPair);
    }));

    it('redirects to next after passphrase is correct', fakeAsync(() => {
        component.onPassphraseConfigured('super secure passphrase');

        tick();

        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['nextRoute']);
    }));

    it('multiple key pairs returned throws an error', fakeAsync(() => {
        const keyPairs = [
            // Return two key pairs
            { publicKey: MOCK_PUB_KEY_BASE_64_STR, privateKey: MOCK_PRIV_KEY_BASE_64_STR },
            { publicKey: MOCK_PUB_KEY_BASE_64_STR, privateKey: MOCK_PRIV_KEY_BASE_64_STR },
        ];
        keyPairServiceSpy.getKeyPairs.and.returnValue(of(keyPairs));

        try {
            component.downloadKeys();
            tick();
            fail('Expected login to throw');
        } catch (e) {
            expect(e.message).toEqual('Expected only one key but got 2 keys');
        }
    }));

    it('redirects to generate keys page when no keys exist', fakeAsync(() => {
        // This test will break when we configure the login container to create the key pair if
        // one does not exist.

        // return zero keys
        const keyPairs = [];
        keyPairServiceSpy.getKeyPairs.and.returnValue(of(keyPairs));

        component.downloadKeys();
        tick();

        expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
        expect(routerSpy.navigate).toHaveBeenCalledWith([EtchedRoutes.KEYS_GENERATE_PATH]);
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
            created: 0,
            version: 1,
        };

        spyOn(component, 'decryptKeyPair').and.callThrough();

        component.onPassphraseConfigured('super secure passphrase');
        tick();

        expect(component.decryptKeyPair).toHaveBeenCalledTimes(1);
        expect(component.decryptKeyPair).toHaveBeenCalledWith('super secure passphrase');

        expect(from2Spy).toHaveBeenCalledTimes(1);
        expect(from2Spy).toHaveBeenCalledWith(
            'encrypted private key',
            'public key',
            'super secure passphrase',
            'kpId',
            'salt',
            1
        );

        expect(component.state).toEqual(component.DECRYPTED_KEYS);
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
        expect(component.state).toEqual(component.ENTERING_PASSPHRASE);
    }));

    // TODO: Add e2e test that checks that enter passphrase form displays error when the
    // passphrase is incorrect
});
