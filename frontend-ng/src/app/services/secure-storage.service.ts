import { Injectable } from '@angular/core';
import { CryptoUtils } from '../utils/crypto-utils';
import { ObjectUtils } from '../utils/object-utils';

export const STORAGE_PRIVATE_KEY = 'enc:private';
export const STORAGE_PUBLIC_KEY = 'enc:public';
export const STORAGE_KEY_PAIR_ID_KEY = 'enc:keyPairId';

const WHITELIST = [STORAGE_PRIVATE_KEY, STORAGE_PUBLIC_KEY, STORAGE_KEY_PAIR_ID_KEY];

/**
 * This is a Typescript port of ProtonMail's "SecureSessionStorage". The
 * comments below are from ProtonMail's source code explaining how it works.
 * The TL;DR: Flush values only on unload and clear them immediately when
 * loading.
 *
 * https://github.com/ProtonMail/WebClient/blob/5e51ac24ba7a24a330544c0bc943cb721d2d8bc0/src/app/commons/services/secureSessionStorage.js
 * -- Start ProtonMail comments
 *
 * Partially inspired by http://www.thomasfrank.se/sessionvars.html
 *
 * This service implements essentially the sessionStorage API. However,
 * we aim to deliberately be non-persistent. This is useful for data that
 * wants to be preserved across refreshes, but is too sensitive to be
 * safely written to disk. Unfortunately, although sessionStorage is
 * deleted when a session ends, major browsers automatically write it
 * to disk to enable a session recovery feature, so using sessionStorage
 * alone is inappropriate.
 *
 * To achieve this, we do two tricks. The first trick is to delay writing
 * any possibly persistent data until the user is actually leaving the
 * page (onunload). This already prevents any persistence in the face of
 * crashes, and severely limits the lifetime of any data in possibly
 * persistent form on refresh.
 *
 * The second, more important trick is to split sensitive data between
 * window.name and sessionStorage. window.name is a property that, like
 * sessionStorage, is preserved across refresh and navigation within the
 * same tab - however, it seems to never be stored persistently. This
 * provides exactly the lifetime we want. Unfortunately, window.name is
 * readable and transferable between domains, so any sensitive data stored
 * in it would leak to random other websites.
 *
 * To avoid this leakage, we split sensitive data into two shares which
 * xor to the sensitive information but which individually are completely
 * random and give away nothing. One share is stored in window.name, while
 * the other share is stored in sessionStorage. This construction provides
 * security that is the best of both worlds - random websites can't read
 * the data since they can't access sessionStorage, while disk inspections
 * can't read the data since they can't access window.name. The lifetime
 * of the data is therefore the smaller lifetime, that of window.name.
 */
@Injectable({
    providedIn: 'root',
})
export class SecureStorageService implements Storage {
    private sessionStorage = window.sessionStorage;
    private nameStorage: object;
    /** Container for actual storage values */
    private data: object;

    constructor() {
        try {
            this.nameStorage = JSON.parse(window.name);
        } catch (e) {
            this.nameStorage = {};
        }

        this.data = {};

        for (const k of WHITELIST) {
            if (!this.nameStorage.hasOwnProperty(k)) {
                // Skip this key
                continue;
            }

            const sessionItemStr: string | null = this.sessionStorage.getItem(k);
            const nameItemStr: string | undefined = this.nameStorage[k];

            // Check that the value exists in session and name storage
            if (sessionItemStr === null || ObjectUtils.isNotDefined(nameItemStr)) {
                console.warn(`${k} is not defined`);
                continue;
            }

            let sessionItem: Uint8Array;
            let nameItem: Uint8Array;
            try {
                sessionItem = CryptoUtils.b64ToBytes(sessionItemStr);
                nameItem = CryptoUtils.b64ToBytes(nameItemStr);
            } catch (e) {
                continue;
            }

            const xored = new Uint8Array(sessionItem.length);
            for (let j = 0; j < sessionItem.length; j++) {
                // tslint:disable:no-bitwise
                xored[j] = sessionItem[j] ^ nameItem[j];
            }

            // Strip off padding
            let unpaddedLength = sessionItem.length;
            while (unpaddedLength > 0 && xored[unpaddedLength - 1] === 0) {
                unpaddedLength--;
            }

            this.data[k] = CryptoUtils.bytesToStr(xored.slice(0, unpaddedLength));
        }

        this.sessionStorage.clear();
        window.name = '';
        this.nameStorage = {};
    }

    public getItem(key: string): string | null {
        if (this.data.hasOwnProperty(key)) {
            return this.data[key];
        }
        return null;
    }

    public setItem(key: string, value: string) {
        this.data[key] = value;
    }

    public removeItem(key) {
        if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
        }
    }

    public clear() {
        this.data = {};
    }

    /**
     * Flushes the stored values to secure storage (lol)
     *
     * Will flush everything in storage, not just keys in the whitelist.
     */
    public flush() {
        for (const key of Object.keys(this.data)) {
            const item = CryptoUtils.strToBytes(this.data[key]);
            const paddedLength = Math.ceil(item.length / 256) * 256;

            // Generate random bytes
            const randomBytes = CryptoUtils.getRandomBytes(paddedLength);
            const xored = new Uint8Array(randomBytes);

            for (let i = 0; i < item.length; i++) {
                // xor the secret with the random bytes
                xored[i] ^= item[i];
            }

            this.nameStorage[key] = CryptoUtils.bytesToB64(randomBytes);
            this.sessionStorage.setItem(key, CryptoUtils.bytesToB64(xored));
        }

        if (Object.keys(this.nameStorage).length > 0) {
            window.name = JSON.stringify(this.nameStorage);
        }
    }

    public key(index: number): string | null {
        throw new Error('not implemented');
    }

    public get length(): number {
        return Object.keys(this.data).length;
    }
}
