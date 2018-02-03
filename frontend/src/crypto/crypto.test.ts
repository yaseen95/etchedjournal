import { EtchedCryptoUtils } from './crypto';
import EncryptWrapper = EtchedCryptoUtils.EncryptWrapper;

test('test hash can be verified', () => {
    let input = 'Bonsoir Elliot';
    let hashed = EtchedCryptoUtils.hashPassphrase(input);
    expect(EtchedCryptoUtils.verifyPassphrase(input, hashed)).toBe(true);
});

test('encrypt/decrypt', () => {
    let input = 'The quick brown fox jumps over the lazy dog';
    let e: EncryptWrapper = EtchedCryptoUtils.encrypt(input);
    expect(EtchedCryptoUtils.decrypt(e)).toBe(input);
});

test('encrypt/decrypt fails', () => {
    let input = 'The quick brown fox jumps over the lazy dog';
    let e: EncryptWrapper = EtchedCryptoUtils.encrypt(input);

    let copy = Object.assign({}, e);
    copy.iv = '0123456789abcdef0123456789abcdef';
    expect(() => {
        EtchedCryptoUtils.decrypt(copy);
    }).toThrow('Decryption failed');

    copy = Object.assign({}, e);
    copy.ciphertext = '0123456789abcdef0123456789abcdef';
    expect(() => {
        EtchedCryptoUtils.decrypt(copy);
    }).toThrow('Decryption failed');

    copy = Object.assign({}, e);
    copy.key = '0123456789abcdef0123456789abcdef';
    expect(() => {
        EtchedCryptoUtils.decrypt(copy);
    }).toThrow('Decryption failed');
});
