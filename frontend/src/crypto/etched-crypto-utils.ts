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
   * Wrapper around a stretched key.
   */
  export class StretchedKey {
    algo: string = 'PBKDF2';
    salt: string;
    keySize: number;
    iterations: number;
    hash: string;

    static fromString(s: string) {
      let split = s.split('_');
      if (split.length !== 5) {
        throw new Error('Invalid hashedPasshprase');
      }
      // TODO: Allow multiple key stretching algorithms
      let algo = split[0];
      let salt = split[1];
      // TODO: Catch exceptions thrown by parseInt
      let keySize = parseInt(split[2], 10);
      let iterations = parseInt(split[3], 10);
      let hash = split[4];
      return new StretchedKey(algo, salt, keySize, iterations, hash);
    }

    constructor(algo: string, salt: string, keySize: number, iterations: number, hash: string) {
      this.algo = algo;
      this.salt = salt;
      this.keySize = keySize;
      this.iterations = iterations;
      this.hash = hash;
    }

    toString(): string {
      return [this.algo, this.salt, this.keySize, this.iterations, this.hash].join('_');
    }
  }

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
  export function verifyPassphrase(userPassphrase: string, hashedPassphrase: string | StretchedKey): boolean {
    if (typeof hashedPassphrase === 'string') {
      hashedPassphrase = StretchedKey.fromString(hashedPassphrase);
    }

    let userHash = CryptoJS.PBKDF2(userPassphrase, hashedPassphrase, {
      keySize: hashedPassphrase.keySize / 32,
      iterations: hashedPassphrase.iterations
    }).toString();

    return hashedPassphrase.hash === userHash;
  }

  /**
   * Hashes the passphrase to be stored on the server.
   * @param {string} userPassphrase
   * @returns {string}
   */
  export function hashPassphrase(userPassphrase: string): StretchedKey {
    let salt = secureHexString(PBKDF2_SALT_HEX_LENGTH);
    let hash = CryptoJS.PBKDF2(userPassphrase, salt, {
      keySize: PBKDF2_KEY_SIZE / 32,
      iterations: PBKDF2_ITERATIONS
    });
    return new StretchedKey('PBKDF2', salt, PBKDF2_KEY_SIZE, PBKDF2_ITERATIONS, hash);
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
   * @param {string?} key - optional - specify hex string key to use for encryption
   * @param {string?} iv - optional - specify hex string iv to use
   * @returns {EtchedCryptoUtils.EncryptWrapper}
   */
  export function encrypt(data: string, key: string | null = null, iv: string | null = null): EncryptWrapper {
    if (key == null) {
      key = secureHexString(AES_KEY_HEX_LENGTH);
    }
    let keyBytes = CryptoJS.enc.Hex.parse(key);

    if (iv == null) {
      iv = secureHexString(AES_IV_HEX_LENGTH);
    }
    let ivBytes = CryptoJS.enc.Hex.parse(iv);

    let encrypted = CryptoJS.AES.encrypt(data, keyBytes, {iv: ivBytes});
    return new EncryptWrapper(key.toString(), ivBytes.toString(), encrypted.toString());
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