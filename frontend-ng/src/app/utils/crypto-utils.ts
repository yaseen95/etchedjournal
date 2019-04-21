import * as openpgp from 'openpgp';

import { Base64Str } from '../services/models/types';

export class CryptoUtils {
    /**
     * Copied from ProtonMail WebClient source
     * Licensed under MIT
     * Has been modified slightly to work better with typescript
     * https://github.com/ProtonMail/WebClient/blob/5e51ac24ba7a24a330544c0bc943cb721d2d8bc0/src/helpers/webcrypto.js
     *
     * @param length
     */
    public static getRandomBytes(length: number) {
        const buf = new Uint8Array(length);
        if (window.crypto && window.crypto.getRandomValues) {
            return window.crypto.getRandomValues(buf);
        }
        const msCrypto = (window as any).msCrypto;
        if (msCrypto && msCrypto.getRandomValues) {
            return msCrypto.getRandomValues(buf);
        }
        throw new Error('No cryptographic randomness!');
    }

    public static bytesToB64(bytes: Uint8Array): Base64Str {
        return openpgp.util.Uint8Array_to_b64(bytes);
    }

    public static b64ToBytes(b64: Base64Str): Uint8Array {
        return openpgp.util.b64_to_Uint8Array(b64);
    }

    public static bytesToStr(bytes: Uint8Array): string {
        return openpgp.util.Uint8Array_to_str(bytes);
    }

    public static strToBytes(str: string): Uint8Array {
        return openpgp.util.str_to_Uint8Array(str);
    }

    public static keyToB64(key: openpgp.key.Key): Base64Str {
        const bytes = key.toPacketlist().write();
        return this.bytesToB64(bytes);
    }

    public static async b64ToKeys(b64: Base64Str): Promise<openpgp.key.Key[]> {
        const bytes = this.b64ToBytes(b64);
        return (await openpgp.key.read(bytes)).keys;
    }
}
