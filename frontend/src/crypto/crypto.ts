import { Etch } from '../models/etch';
import { EtchedCryptoUtils } from './etched-crypto-utils';
import EncryptWrapper = EtchedCryptoUtils.EncryptWrapper;

export class EtchEncrypter {

  masterKey: string;

  constructor(masterKey: string) {
    this.masterKey = masterKey;
  }

  /**
   * Encrypt the content and return it as an Etch
   * @param {string} content
   * @returns {Etch}
   */
  encrypt(content: string) {
    // Firstly encrypt the content
    let encrypted = EtchedCryptoUtils.encrypt(content);

    // Encrypt the key and iv used to encrypt the content
    let etchIv = EtchedCryptoUtils.secureHexString();
    let contentKey = EtchedCryptoUtils.encrypt(encrypted.key, this.masterKey, etchIv).ciphertext;
    let contentIv = EtchedCryptoUtils.encrypt(encrypted.iv, this.masterKey, etchIv).ciphertext;

    return new Etch(encrypted.ciphertext, contentKey, contentIv, etchIv, true);
  }

  /**
   * Decrypts the etch and returns it as a new Etch
   * @param {Etch} etch
   * @returns {Etch}
   */
  decrypt(etch: Etch) {
    // Decrypt the encrypted key and iv
    let decKey = EtchedCryptoUtils.decrypt(new EncryptWrapper(this.masterKey, etch.initVector, etch.contentKey));
    let decIv = EtchedCryptoUtils.decrypt(new EncryptWrapper(this.masterKey, etch.initVector, etch.contentIv));

    // Decrypt the content using the decrypted key and iv
    let decContent = EtchedCryptoUtils.decrypt(new EncryptWrapper(decKey, decIv, etch.content));
    return new Etch(decContent, decKey, decIv, etch.initVector, false);
  }
}
