const getRandomValues = require('get-random-values');
const arrayBufferToHex = require('array-buffer-to-hex');
const hexToArrayBuffer = require('hex-to-array-buffer');
import { TextEncoder } from 'text-encoding';

const AES_KEY_BIT_LENGTH = 256;
const AES_IV_BIT_LENGTH = 128;

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
    return [this.algo, this.stretcherAlgo, this.salt, this.keySize, this.iterations, this.hash].join('_');
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
   * @param {StretchedKey} expected
   * @returns {PromiseLike<boolean>}
   */
  static verifyPassphrase(userPassphrase: string, expected: StretchedKey): PromiseLike<boolean> {

    return EtchedCryptoUtils.hashPassphrase(userPassphrase, expected.salt)
      .then((key: StretchedKey) => {
        return (key.algo === expected.algo &&
          key.stretcherAlgo === expected.stretcherAlgo &&
          key.salt === expected.salt &&
          key.iterations === expected.iterations &&
          key.keySize === expected.keySize &&
          key.hash === expected.hash);
      });
  }

  /**
   * Hashes the passphrase to be stored on the server.
   * @param {string} userPassphrase
   * @param {string?} salt
   * @param {PassphraseHashProperties?} properties
   * @returns {PromiseLike<StretchedKey>}
   */
  static hashPassphrase(
    userPassphrase: string,
    salt?: string,
    properties?: PassphraseHashProperties): PromiseLike<StretchedKey> {

    let saltStr = salt ? salt : EtchedCryptoUtils.secureHexString(PASSPHRASE_HASH_SALT_SIZE);
    let hashProps = properties ? properties : DEFAULT_PASSPHRASE_HASH_PROPERTIES;

    let encoder = new TextEncoder('utf-8');
    let passphraseBytes = encoder.encode(userPassphrase);
    let saltBytes = encoder.encode(saltStr);

    return window.crypto.subtle.importKey(
      'raw',
      passphraseBytes,
      hashProps.algo,
      false,
      ['deriveBits']
    ).then((key: CryptoKey) => {
      let pbkdf2Params: Pbkdf2Params = {
        name: hashProps.algo,
        salt: saltBytes,
        iterations: hashProps.iterations,
        hash: hashProps.stretcherAlgo
      };
      return window.crypto.subtle.deriveBits(pbkdf2Params, key, hashProps.keySize);

    }).then((hashBytes: ArrayBuffer) => {
      let hashString = arrayBufferToHex(hashBytes);
      return new StretchedKey(hashProps.algo, hashProps.stretcherAlgo, saltStr, hashProps.keySize, hashProps.iterations,
        hashString);
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
   * Encrypts a string
   * @param {string} data - content to encrypt
   * @param {string} key - Optional supply the key used for encryption. Otherwise generate a random one.
   * @param {string} iv - Optional supply the iv used for encryption. Otherwise generate a random one.
   * @returns {Promise<EncryptWrapper>}
   */
  public static encrypt(data: string, key?: string, iv?: string): Promise<EncryptWrapper> {

    let encryptionKeyStr = key ? key : arrayBufferToHex(getRandomValues(new Uint8Array(AES_KEY_BIT_LENGTH / 8)));
    let encryptionIvStr = iv ? iv : arrayBufferToHex(getRandomValues(new Uint8Array(AES_IV_BIT_LENGTH / 8)));

    let encryptionKeyBytes = hexToArrayBuffer(encryptionKeyStr);
    let encryptionIvBytes = hexToArrayBuffer(encryptionIvStr);

    let encoder = new TextEncoder('utf-8');
    let dataBytes = encoder.encode(data);

    let importedKey = this.importAesGcmKey(encryptionKeyBytes, ['encrypt']);

    return importedKey.then((cryptoKey: CryptoKey) => {
      return window.crypto.subtle.encrypt(
        {name: 'AES-GCM', iv: encryptionIvBytes},
        cryptoKey,
        dataBytes.buffer
      ).then((ciphertextBytes: ArrayBuffer) => {
        let ciphertext = arrayBufferToHex(ciphertextBytes);
        return new EncryptWrapper(encryptionKeyStr, encryptionIvStr, ciphertext);
      });
    }) as Promise<EncryptWrapper>;
  }

  /**
   * Decrypts the encrypted wrapper into a string.
   * @param {EncryptWrapper} wrapper
   * @returns {Promise<string>}
   */
  public static decrypt(wrapper: EncryptWrapper): Promise<string> {
    let encryptionKeyBytes = hexToArrayBuffer(wrapper.key);
    let encryptionIvBytes = hexToArrayBuffer(wrapper.iv);
    let ciphertextBytes = hexToArrayBuffer(wrapper.ciphertext);

    let importKey = this.importAesGcmKey(encryptionKeyBytes, ['decrypt']);

    return importKey
      .then((key: CryptoKey) => {
        let decrypted = window.crypto.subtle.decrypt(
          {name: 'AES-GCM', iv: encryptionIvBytes},
          key,
          ciphertextBytes
        ) as Promise<ArrayBuffer>;

        return decrypted
          .then((decryptedBytes: ArrayBuffer) => {
            return new TextDecoder().decode(decryptedBytes);
          }).catch((reason => {
            throw new Error(`Decryption failed`);
          }));
      });
  }

  private static importAesGcmKey(keyBytes: ArrayBuffer, keyUsages: string[]): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      {name: 'AES-GCM'},
      false,
      keyUsages
    ) as Promise<CryptoKey>;
  }
}
