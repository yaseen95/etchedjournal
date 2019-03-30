import { fakeAsync, TestBed } from '@angular/core/testing';
import { CryptoUtils } from '../utils/crypto-utils';

import { EncrypterService } from './encrypter.service';
import { TEST_PRIVATE_KEY_DECRYPTED, TEST_PUBLIC_KEY } from './encrypter.spec';
import {
    SecureStorageService,
    STORAGE_KEY_PAIR_ID_KEY,
    STORAGE_PRIVATE_KEY,
    STORAGE_PUBLIC_KEY,
} from './secure-storage.service';

describe('EncrypterService', () => {
    let service: EncrypterService;

    let storage: Storage;
    let mockB64ToBytes: any;
    let mockKeyToB64: any;

    beforeEach(() => {
        storage = localStorage;
        storage.clear();

        mockB64ToBytes = spyOn(CryptoUtils, 'b64ToBytes');
        mockKeyToB64 = spyOn(CryptoUtils, 'keyToB64');
        mockKeyToB64.and.returnValues('1', '2', '3');

        TestBed.configureTestingModule({
            providers: [{ provide: SecureStorageService, useValue: storage }],
        });

        service = TestBed.get(EncrypterService);
    });

    it('encrypter should be null by default', () => {
        expect(service.encrypter).toBeNull();
    });

    it('set encrypter null should throw', () => {
        expect(() => {
            service.encrypter = null;
        }).toThrow(new Error('Encrypter cannot be null'));
    });

    it('load encrypter loads items', async () => {
        storage.setItem(STORAGE_PUBLIC_KEY, TEST_PUBLIC_KEY);
        storage.setItem(STORAGE_PRIVATE_KEY, TEST_PRIVATE_KEY_DECRYPTED);
        storage.setItem(STORAGE_KEY_PAIR_ID_KEY, 'keyId');
        const encrypter = await service.loadEncrypter();
        expect(encrypter.keyPairId).toEqual('keyId');
    });

    it('does not load encrypter if not all storage keys are defined', async () => {
        storage.setItem(STORAGE_PUBLIC_KEY, TEST_PUBLIC_KEY);
        storage.setItem(STORAGE_PRIVATE_KEY, TEST_PRIVATE_KEY_DECRYPTED);
        // excluding key pair id key
        const encrypter = await service.loadEncrypter();
        expect(encrypter).toBeNull();
        expect(service.encrypter).toBeNull();
    });

    it('set encrypter undefined should throw', () => {
        expect(() => {
            service.encrypter = undefined;
        }).toThrow(new Error('Encrypter cannot be null'));
    });

    it('set and get returns set encrypter', () => {
        service.encrypter = { foo: 'bar', publicKeys: [] } as any;
        expect((service.encrypter as any).foo).toEqual('bar');
    });

    it('emits encrypter after it is set', fakeAsync(() => {
        let retrieved = false;
        service.encrypterObs.subscribe(e => {
            expect((e as any).foo).toEqual('bar');
            retrieved = true;
        });
        service.encrypter = { foo: 'bar', publicKeys: [] } as any;
        expect(retrieved).toBe(true);
    }));

    it('stores key details in storage after encrypter is set', () => {
        service.encrypter = { publicKeys: [], keyPairId: 'id' } as any;
        const privateKeyStr = storage.getItem(STORAGE_PRIVATE_KEY);
        const publicKeyStr = storage.getItem(STORAGE_PUBLIC_KEY);
        const keyPairId = storage.getItem(STORAGE_KEY_PAIR_ID_KEY);

        // mocked out by mockKeyToB64
        expect(privateKeyStr).toEqual('1');
        expect(publicKeyStr).toEqual('2');
        expect(keyPairId).toEqual('id');
        expect(storage.length).toEqual(3);
    });
});
