const CryptoJS = require('crypto-js');
const getRandomValues = require('get-random-values');

export module EtchedCryptoUtils {

    const HEX_CHARSET: string = '0123456789abcdef';
    const PBKDF2_KEY_SIZE: number = 256;
    // TODO: Allow users to modify iterations.
    const PBKDF2_ITERATIONS: number = 25000;
    const PBKDF2_SALT_HEX_LENGTH: number = 64;
    const AES_KEY_HEX_LENGTH: number = 64;  // equivalent to 256 bit key
    const AES_IV_HEX_LENGTH: number = 32;

    /**
     * Wrapper around encryption key, iv, and ciphertext.
     */
    export class EncryptWrapper {
        key: string;
        iv: string;
        ciphertext: string;

        constructor(key: string, iv: string, encrypted: string) {
            this.key = key;
            this.iv = iv;
            this.ciphertext = encrypted;
        }
    }

    /**
     * Verifies that the user passphrase is correct.
     * @param {string} userPassphrase
     * @param {string} hashedPassphrase
     * @returns {boolean}
     * @throws Error
     */
    export function verifyPassphrase(userPassphrase: string, hashedPassphrase: string): boolean {
        let split = hashedPassphrase.split('_');
        if (split.length !== 5) {
            throw new Error('Invalid hashedPasshprase');
        }
        // TODO: Allow multiple key stretching algorithms
        // let _algo = split[0];
        let salt = split[1];
        let keySize = parseInt(split[2], 10);
        let iterations = parseInt(split[3], 10);
        let storedHash = split[4];

        let userHash = CryptoJS.PBKDF2(userPassphrase, salt, {
            keySize: keySize / 32,
            iterations: iterations
        }).toString();

        return storedHash === userHash;
    }

    /**
     * Hashes the passphrase to be stored on the server.
     * @param {string} userPassphrase
     * @returns {string}
     */
    export function hashPassphrase(userPassphrase: string): string {
        let salt = secureHexString(PBKDF2_SALT_HEX_LENGTH);
        let hash = CryptoJS.PBKDF2(userPassphrase, salt, {
            keySize: PBKDF2_KEY_SIZE / 32,
            iterations: PBKDF2_ITERATIONS
        });
        return `PBKDF2_${salt}_${PBKDF2_KEY_SIZE}_${PBKDF2_ITERATIONS}_${hash.toString()}`;
    }

    /**
     * Generates a secure random hex string.
     * @param {number} length number of characters. Default = 32 (equivalant to 128 bit key).
     * @returns {string}
     */
    export function secureHexString(length: number = 32): string {
        if (length < 0) {
            throw new Error('Length must be > 0.');
        }
        let out = Array(length).fill('');
        let randoms = new Uint8Array(length);
        getRandomValues(randoms);
        for (let i = 0; i < out.length; i++) {
            out[i] = HEX_CHARSET[randoms[i] % HEX_CHARSET.length];
        }
        return out.join('');
    }

    /**
     * Encrypts the passed object
     * @param {string} data
     * @returns {EtchedCryptoUtils.EncryptWrapper}
     */
    export function encrypt(data: string): EncryptWrapper {
        let key = CryptoJS.enc.Hex.parse(secureHexString(AES_KEY_HEX_LENGTH));
        let iv = CryptoJS.enc.Hex.parse(secureHexString(AES_IV_HEX_LENGTH));
        let encrypted = CryptoJS.AES.encrypt(data, key, {iv: iv});
        return new EncryptWrapper(key.toString(), iv.toString(), encrypted.toString());
    }

    /**
     * Decrypts ciphertext.
     * @param {EtchedCryptoUtils.EncryptWrapper} wrapper
     * @returns {string}
     */
    export function decrypt(wrapper: EncryptWrapper): string {
        let key = CryptoJS.enc.Hex.parse(wrapper.key);
        let iv = CryptoJS.enc.Hex.parse(wrapper.iv);
        let decryptedBytes = CryptoJS.AES.decrypt(wrapper.ciphertext, key, {iv: iv});
        let decrypted = null;
        try {
            decrypted = decryptedBytes.toString(CryptoJS.enc.Utf8);
        } catch (e) {
            throw new Error('Decryption failed');
        }
        if (decrypted.length === 0) {
            throw new Error('Decryption failed');
        }
        return decrypted;
    }
}
