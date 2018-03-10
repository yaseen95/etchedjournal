const CryptoJS = require('crypto-js');
const getRandomValues = require('get-random-values');
const arrayBufferToHex = require('array-buffer-to-hex');
import { TextEncoder } from 'text-encoding';

const AES_KEY_HEX_LENGTH = 64;  // equivalent to 256 bit key
const AES_IV_HEX_LENGTH = 32;

// TODO: Allow users to modify iterations.
const PASSPHRASE_HASH_ALGO: string = 'PBKDF2';
const PASSPHRASE_HASH_STRETCHER_ALGO: string = 'sha-1';
const PASSPHRASE_HASH_ITERATIONS: number = 100000;
const PASSPHRASE_HASH_KEY_SIZE: number = 256;
const PASSPHRASE_HASH_SALT_SIZE: number = 20;

interface PassphraseHashProperties {
  readonly algo: string;
  readonly iterations: number;
  readonly keySize: number;
  readonly stretcherAlgo: string;
}

const DEFAULT_PASSPHRASE_HASH_PROPERTIES: PassphraseHashProperties = {
  algo: PASSPHRASE_HASH_ALGO,
  iterations: PASSPHRASE_HASH_ITERATIONS,
  keySize: PASSPHRASE_HASH_KEY_SIZE,
  stretcherAlgo: PASSPHRASE_HASH_STRETCHER_ALGO
};

/**
 * Wrapper around a stretched key.
 */
export class StretchedKey {

  algo: string;
  stretcherAlgo: string;
  salt: string;
  keySize: number;
  iterations: number;
  hash: string;

  /**
   * Instantiates a StretchedKey object from a string.
   * @param s {string}
   * @returns {StretchedKey}
   */
  static fromString(s: string) {
    let split = s.split('_');
    if (split.length !== 6) {
      throw new Error('Invalid hashedPasshprase');
    }
    // TODO: Allow multiple key stretching algorithms
    let algo = split[0];
    let stretcherAlgo = split[1];
    let salt = split[2];
    // TODO: Catch exceptions thrown by parseInt
    let keySize = parseInt(split[3], 10);
    let iterations = parseInt(split[4], 10);
    let hash = split[5];
    return new StretchedKey(algo, stretcherAlgo, salt, keySize, iterations, hash);
  }

  /**
   *
   * @param algo {string} Algorithm to use when stretching a passphrase
   * @param stretcherAlgo {string} algo used
   * @param salt {string} Salt used as input into the key stretcher
   * @param keySize {number} Size of key
   * @param iterations {number} Number of iterations to perform
   * @param hash {string} The resulting hash once encryption is complete.
   */
  constructor(algo: string, stretcherAlgo: string, salt: string, keySize: number, iterations: number, hash: string) {
    this.algo = algo;
    this.stretcherAlgo = stretcherAlgo;
    this.salt = salt;
    this.keySize = keySize;
    this.iterations = iterations;
    this.hash = hash;
  }

  toString() {
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

  /**
   *
   * @param key {string} Key used for encryption
   * @param iv {string} Initialization vector used for encryption
   * @param encrypted {string} Resulting ciphertext of encryption
   */
  constructor(key: string, iv: string, encrypted: string) {
    this.key = key;
    this.iv = iv;
    this.ciphertext = encrypted;
  }
}

export class EtchedCryptoUtils {

  /**
   * Verifies that the user passphrase is correct.
   * @param {string} userPassphrase
   * @param {string | StretchedKey} hashedPassphrase
   * @returns {PromiseLike<boolean>}
   */
  static verifyPassphrase(userPassphrase: string, hashedPassphrase: string | StretchedKey): PromiseLike<boolean> {

    let stretchedKey: StretchedKey;
    if (typeof hashedPassphrase === 'string') {
      stretchedKey = StretchedKey.fromString(hashedPassphrase);
    } else {
      stretchedKey = hashedPassphrase;
    }

    return EtchedCryptoUtils.hashPassphrase(userPassphrase)
      .then((key: StretchedKey) => {
        return (key.algo === stretchedKey.algo &&
            key.stretcherAlgo === stretchedKey.stretcherAlgo &&
            key.iterations === stretchedKey.iterations &&
            key.keySize === stretchedKey.keySize &&
            key.hash === stretchedKey.hash);
      });
  }

  /**
   * Hashes the passphrase to be stored on the server.
   * @param {string} userPassphrase
   * @param {string | null} salt
   * @param {PassphraseHashProperties | null} properties
   * @returns {PromiseLike<StretchedKey>}
   */
  static hashPassphrase(
    userPassphrase: string,
    salt: string | null = null,
    properties: PassphraseHashProperties | null = null): PromiseLike<StretchedKey> {

    let saltStr: string;
    if (salt === null || salt === undefined) {
      saltStr = EtchedCryptoUtils.secureHexString(PASSPHRASE_HASH_SALT_SIZE);
    } else {
      saltStr = salt;
    }

    let props: PassphraseHashProperties;
    if (properties == null) {
      props = DEFAULT_PASSPHRASE_HASH_PROPERTIES;
    } else {
      props = properties;
    }

    console.log(`salt ${saltStr}`);
    let encoder = new TextEncoder('utf-8');

    let passphraseBytes = encoder.encode(userPassphrase);
    let saltBytes = encoder.encode(saltStr);

    return window.crypto.subtle.importKey(
      'raw',
      passphraseBytes,
      props.algo,
      false,
      ['deriveBits']
    ).then((key: CryptoKey) => {
      let pbkdf2Params: Pbkdf2Params = {
        name: props.algo,
        salt: saltBytes,
        iterations: props.iterations,
        hash: props.stretcherAlgo
      };
      return window.crypto.subtle.deriveBits(pbkdf2Params, key, props.keySize);

    }).then((hashBytes: ArrayBuffer) => {
      let hashString = arrayBufferToHex(hashBytes);
      console.log(hashString);
      return new StretchedKey(props.algo, props.stretcherAlgo, saltStr, props.keySize, props.iterations, hashString);
    });
  }

  /**
   * Generates a secure random hex string.
   * @param {number} length number of characters. Default = 32 (equivalant to 128 bit key).
   * @returns {string}
   */
  static secureHexString(length: number = 32): string {
    if (length < 0) {
      throw new Error('Length must be > 0.');
    }
    let randoms = new Uint8Array(length);
    getRandomValues(randoms);
    return arrayBufferToHex(randoms.buffer);
  }

  /**
   * Encrypts the passed object
   * @param {string} data
   * @param {string | null} key - optional - specify hex string key to use for encryption
   * @param {string | null} iv - optional - specify hex string iv to use
   * @returns {EncryptWrapper}
   */
  static encrypt(data: string, key: string | null = null, iv: string | null = null): EncryptWrapper {
    if (key == null) {
      key = this.secureHexString(AES_KEY_HEX_LENGTH);
    }
    let keyBytes = CryptoJS.enc.Hex.parse(key);

    if (iv == null) {
      iv = this.secureHexString(AES_IV_HEX_LENGTH);
    }
    let ivBytes = CryptoJS.enc.Hex.parse(iv);

    let encrypted = CryptoJS.AES.encrypt(data, keyBytes, {iv: ivBytes});
    return new EncryptWrapper(key.toString(), ivBytes.toString(), encrypted.toString());
  }

  /**
   * Decrypts ciphertext.
   * @param {EncryptWrapper} wrapper
   * @returns {string}
   */
  static decrypt(wrapper: EncryptWrapper): string {
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
