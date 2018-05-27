import { Etch } from '../models/etch';
import { EtchedCryptoUtils, EncryptWrapper } from './etched-crypto';

export class EtchEncrypter {

  masterKey: string;

  constructor(masterKey: string) {
    this.masterKey = masterKey;
  }

  /**
   * Encrypt the content and return it as an Etch.
   *
   * Internally the etch is encrypted using a random key and iv. The random key and iv are then also
   * encrypted using another random iv and the master key.
   *
   * @param {string} content
   * @returns {Promise<Etch>}
   */
  encrypt(content: string): Promise<Etch> {
    return EtchedCryptoUtils.encrypt(content)
      .then((wrapper: EncryptWrapper) => {
        let encryptedKey = EtchedCryptoUtils.encrypt(wrapper.key, this.masterKey);
        let encryptedIv = EtchedCryptoUtils.encrypt(wrapper.iv, this.masterKey);

        return Promise.all([encryptedKey, encryptedIv])
          .then((values: [EncryptWrapper, EncryptWrapper]) => {
            let key = values[0];
            let iv = values[1];
            return new Etch(wrapper.ciphertext, key.ciphertext, iv.ciphertext, key.iv, iv.iv);
          });
      });
  }

  /**
   * Decrypts the etch and returns it as a new Etch
   * @param {Etch} etch
   * @returns {Etch}
   */
  decrypt(etch: Etch): Promise<Etch> {
    // Decrypt the encrypted key and iv
    const keyWrapper = new EncryptWrapper(this.masterKey, etch.keyIv, etch.contentKey);
    const ivWrapper = new EncryptWrapper(this.masterKey, etch.ivIv, etch.contentIv);
    const contentKey = EtchedCryptoUtils.decrypt(keyWrapper);
    const contentIv = EtchedCryptoUtils.decrypt(ivWrapper);

    return Promise.all([contentKey, contentIv])
      .then((values: [string, string]) => {
        // The decrypted key and iv can now be used to decrypt the content
        let keyStr = values[0];
        let ivStr = values[1];

        let etchKey = EtchedCryptoUtils.decrypt(new EncryptWrapper(keyStr, ivStr, etch.content));
        return etchKey.then((decryptedContent: string) => {
          return new Etch(decryptedContent, keyStr, ivStr, etch.keyIv, etch.ivIv);
        });
      });
  }
}
