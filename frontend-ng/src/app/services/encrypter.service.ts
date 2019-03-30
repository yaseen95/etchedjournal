import { Injectable } from '@angular/core';
import * as openpgp from 'openpgp';
import { Subject } from 'rxjs';
import { CryptoUtils } from '../utils/crypto-utils';
import { Encrypter } from './encrypter';
import {
    SecureStorageService,
    STORAGE_KEY_PAIR_ID_KEY,
    STORAGE_PRIVATE_KEY,
    STORAGE_PUBLIC_KEY,
} from './secure-storage.service';

@Injectable({
    providedIn: 'root',
})
export class EncrypterService {
    private enc: Encrypter = null;

    /**
     * Broadcasts when encrypter has been set
     *
     * Used as a gate to trigger getting/decrypting encrypted entities.
     */
    public encrypterObs: Subject<Encrypter>;
    public loading: boolean;

    constructor(private storage: SecureStorageService) {
        this.encrypterObs = new Subject();
    }

    public async loadEncrypter(): Promise<Encrypter | null> {
        const privateKeyStr = this.storage.getItem(STORAGE_PRIVATE_KEY);
        const publicKeyStr = this.storage.getItem(STORAGE_PUBLIC_KEY);
        const keyPairId = this.storage.getItem(STORAGE_KEY_PAIR_ID_KEY);

        if ([privateKeyStr, publicKeyStr, keyPairId].some(v => v === null)) {
            return Promise.resolve(null);
        }

        const privBytes = CryptoUtils.b64ToBytes(privateKeyStr);
        const pubBytes = CryptoUtils.b64ToBytes(publicKeyStr);

        const privateKey: openpgp.key.Key = (await openpgp.key.read(privBytes)).keys[0];
        const publicKeys: openpgp.key.Key[] = (await openpgp.key.read(pubBytes)).keys;

        // TODO Is it okay to set privateKeyEncrypted to null?
        this.enc = new Encrypter(privateKey, publicKeys, null, keyPairId);
        this.encrypterObs.next(this.enc);
        return this.enc;
    }

    public get encrypter(): Encrypter | null {
        return this.enc;
    }

    public set encrypter(e: Encrypter) {
        if (e === null || e === undefined) {
            throw new Error('Encrypter cannot be null');
        }

        const privateKeyStr = CryptoUtils.keyToB64(e.privateKey);
        const publicKeyStr = CryptoUtils.keyToB64(e.publicKeys[0]);

        this.storage.setItem(STORAGE_PRIVATE_KEY, privateKeyStr);
        this.storage.setItem(STORAGE_PUBLIC_KEY, publicKeyStr);
        this.storage.setItem(STORAGE_KEY_PAIR_ID_KEY, e.keyPairId);

        this.enc = e;
        this.encrypterObs.next(e);
    }
}
