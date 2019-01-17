import { async, TestBed } from '@angular/core/testing';

import * as openpgp from 'openpgp';
import { Encrypter, KeyPair } from './encrypter';

describe('Encrypter', () => {

    let encrypter: Encrypter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({});
        Encrypter.from2(
            TEST_PRIVATE_KEY,
            TEST_PUBLIC_KEY,
            'passphrase',
            'foobar',
            TEST_KEY_PAIR.salt,
            TEST_KEY_PAIR.iterations
        )
            .then(enc => encrypter = enc);
    }));

    it('generate key pair stretches passphrase', async () => {
        const keyPair = await Encrypter.generateKey('passphrase', 'tester');
        expect(keyPair.iterations).toEqual(10);
        expect(keyPair.salt).toMatch(/[a-zA-Z0-9+\/.]{22}/);
    });

    it('generated key pair can instantiate Encrypter.from', async () => {
        const keyPair = await Encrypter.generateKey('passphrase', 'samsepiol');
        const enc = await Encrypter.from(keyPair, 'passphrase');
        expect(enc).toBeDefined();
    });

    it('encrypt and decrypt', async () => {
        const ciphertext = await encrypter.encrypt('test data');
        expect(ciphertext).not.toEqual('test data');
        const decrypted = await encrypter.decrypt(ciphertext);
        expect(decrypted).toEqual('test data');
    });

    it('decrypt existing message', (async () => {
        const decrypted = await encrypter.decrypt(TEST_DATA_ENCRYPTED_AND_SIGNED);
        expect(decrypted).toEqual('test data');
    }));

    it('decrypt unsigned message fails', async () => {
        let decrypted;
        try {
            decrypted = await encrypter.decrypt(TEST_DATA_ENCRYPTED_UNSIGNED);
            fail();
        } catch (e) {
            expect(e.message).toEqual('Decrypted message is unsigned');
        }
        expect(decrypted).toBeUndefined();
    });

    it('symmetric encrypt and decrypt', async () => {
        const ciphertext = await Encrypter.symmetricEncrypt('plaintext data', 'password');
        const decrypted = await Encrypter.symmetricDecrypt(ciphertext, 'password');
        expect(decrypted).toEqual('plaintext data');
    });

    it('symmetric decrypt existing message', async () => {
        const decrypted = await Encrypter.symmetricDecrypt(TEST_DATA_SYMMETRICALLY_ENCRYPTED,
            'password');
        expect(decrypted).toEqual('test data');
    });

    it('symmetric decrypt with incorrect password fails', async () => {
        let decrypted;
        try {
            decrypted = await Encrypter.symmetricDecrypt(TEST_DATA_SYMMETRICALLY_ENCRYPTED,
                'PASSWORD');
            fail();
        } catch (e) {
            expect(e.message).toEqual('Password is incorrect');
        }
        expect(decrypted).toBeUndefined();
    });

    it('user id generation', () => {
        const actual = Encrypter.createUserId('samsepiol');
        expect(Object.keys(actual).length).toEqual(2);
        expect(actual.email).toEqual('samsepiol@users.etchedjournal.com');
        expect(actual.name).toEqual('samsepiol');
    });

    it('base 64 encoding utils', () => {
        const array = new Uint8Array([5, 6, 7, 8]);
        const actual = openpgp.util.Uint8Array_to_b64(array);
        expect(actual).toEqual('BQYHCA==');
    });

    it('read private key', async () => {
        const privBytes = openpgp.util.b64_to_Uint8Array(TEST_PRIVATE_KEY);
        const keys = await openpgp.key.read(privBytes);
        expect(keys.keys.length).toEqual(1);
        expect(keys.keys[0].isPrivate).toBeTruthy();
    });
});

/** the message 'test data' encrypted via pgp (public private mode) */
const TEST_DATA_ENCRYPTED_AND_SIGNED =
    `wcACA5WJrqJD4RmSEgQjBADydEGQNvb6eNv+gsmVrkpfEyd1SqkPyjmxHQxL
Kw34H4PwiKRlhX7wMri6CfaN00xFXt9Jyz3q1c0ar81Kj7UoSAFsz22QqyuU
QJUBe2ag2ryrmRo2CGrBZtJdG+0lpTDMHRBHMYT7RvtyXkyfgUvmQ7mC4ot9
0gkovA9/ge6GadnDADAlvUjAX4egOt7zrCGEbB1DCGcwn5s6/I0BrpALq5sl
fDSdLNg09EOsIqEpf74gLVTSwGkB3hCexZV+43tj1f+Ze1QzfTv+wNWoGvT1
fSWX6PRiZgnlpI3Lfd7qLKYXHvSiMLhIoij8wgSCk+qeO8jF0kLRTAomW2lb
24/OhKcJmnTMSnj6qQThxo9AtsR9PTYUkmbL+BAT6rQm4Ha/4dhIyKSlc8uF
xzgKJ6GnioyWSCrROvf6D6Goysk60im00XhNLpaV+9S+Jd3ZiqZwGdsqH3y9
fBFYJO5XLZmB4ZQQIx4O4zQSvhwVh4dJ1fgFeR6XqfqnLTCiV4k1wtd44/lA
+8jSZ+77Hteqgtubps1JmieH+4TRgQeGKv6FEEaHHApxKvoEsTpxOaqOpGZp
SfWgVkf//7O591QEKLXEXA/h1Xmd4PdFNFfxSaKbFnQZiaeflC5M6XYbRi7o
LqI=`;

/** the message 'test data' encrypted but not signed with the private key */
const TEST_DATA_ENCRYPTED_UNSIGNED =
    `wcACA5WJrqJD4RmSEgQjBAGucWqeX7esvgrM7ha5j3Q/ceYtgFKZ0XEPxqnt
p/2CNdFAN6N4+IM7TCRFT+HIinQBAKFLCtb7tPVKuZD/rK2wQwB967y/cZZc
wbLsHchEf9vraKHexzx+xm+VCdhbMx1+RhczxHepZEYBWdvy4be2bk+w9wsz
UFCx76rxgPuyldXhpzAEAdJlCH4jPMef0jl/teHKJE67zYoEMP5xkks35mpN
q0XmzoS7rtc4bpIygwLHVkDSSgG7/sYdttxUXZlesTPWxF7+vRAieU/jsVtI
dCxCH9G5fV7SkWjv3zakYNeFOP7GSJFgSyvvXzlI127ci0RG+mKrAU3Mao8k
N0+4`;

const TEST_DATA_SYMMETRICALLY_ENCRYPTED =
    `wy4ECQMIXo+rdaah8y1gZ4y3YheRV06CBUsLrUpcpNXXq8PIvrYrnCQxiuyh
Ld7b0kEBzPByJMMVhKXKNusjugSzlBKHVOAShh+IOfcUSkOcXyx54N3UquA0
vFPuY717NmO5f8gHzsCufXe+bIBySp3FwA==`;

const TEST_PUBLIC_KEY =
    `xpMEXCYGARMFK4EEACMEIwQBlgWBpChNouPXaljJdlyEcUH4qpSrj5T3Grbi
gcjxgxZsVblYslN0LgITFy+PlrWGib1tg0mD+dG1k/q3FxnSGM0BatjGq5by
eH5JXRBGJaoUF6sshTj9bZoTu+W7pXgbbhXjSLMV4As5tcQYFgJ+CP9C52AD
1dZBTvKEnsAsK63X27fNJ3Rlc3RlciA8dGVzdGVyQHVzZXJzLmV0Y2hlZGpv
dXJuYWwuY29tPsK7BBATCgApBQJcJgYBBgsJBwgDAgkQHxjvouPk4ysEFQgK
AgMWAgECGQECGwMCHgEAAJhbAgkBTZ8ri19aa/oFC8VEMcBotc3RzRpK5MKm
Nvk6koxcqCrrXH2KOC3xZHqAaCTEpWwLe3Jc4yZ3C9a23fSkT3It1IoCCQGY
ovZZCx+FhLpE4U9qEDRK8Au4DHCyDjLnD3tiREghOj1ubm0BK92qgqDRY2A2
9QIIMjec0wBZ2j+UVDEoFfQRg86XBFwmBgESBSuBBAAjBCMEABPkBYkFQduh
7LjMf6w/jvnww8aWTSQdSLgmjXBViZ0L6hFREi8BkduYz7X+uW1783hwHwr3
mUTv87tQvhiI+bg3AZpIrLedJsPdtbQvMNIT43Ps0VeT85RX6GmAjh1ZHgVq
QzsCWm+Uv0cmG1IkMERc0suNFoRDIeYAsRD8Mq5+ZNKjAwEKCcKkBBgTCgAT
BQJcJgYBCRAfGO+i4+TjKwIbDAAAAMcCCQH1EgozIdeT/PZ0syMvJtBXZMhJ
7tKJ/M9AwiNwmJt3iJkz15fboN/ukkN6se90AyB2ZDHYeJE3rJh14SjTSUqQ
9AII58WkFVRInD74Z0+yf95vx5PL96N7EV06irP5YHHpt2uva1y9in7OIH0Z
oMGgIVka2C0HZCOF69ZLNVCEJxXhM8c=`;

const TEST_PRIVATE_KEY =
    `xcBHBFwmBgETBSuBBAAjBCMEAZYFgaQoTaLj12pYyXZchHFB+KqUq4+U9xq2
4oHI8YMWbFW5WLJTdC4CExcvj5a1hom9bYNJg/nRtZP6txcZ0hjNAWrYxquW
8nh+SV0QRiWqFBerLIU4/W2aE7vlu6V4G24V40izFeALObXEGBYCfgj/Qudg
A9XWQU7yhJ7ALCut19u3/gkDCBL0uusuo9EyYDDUj+VWw+Thuyv1MfctKdGf
tEtcAqVjB6h3T7Wa9qvNToZj5GAzy2ticeF2fHzqKLp3Klg79bIuFzOxm5jm
qdbW0FbHm8t1CNt323nlJBmhQC2EBsMvDHyPETKz3hZWCR8bXmX8ZBfNJ3Rl
c3RlciA8dGVzdGVyQHVzZXJzLmV0Y2hlZGpvdXJuYWwuY29tPsK7BBATCgAp
BQJcJgYBBgsJBwgDAgkQHxjvouPk4ysEFQgKAgMWAgECGQECGwMCHgEAAJhb
AgkBTZ8ri19aa/oFC8VEMcBotc3RzRpK5MKmNvk6koxcqCrrXH2KOC3xZHqA
aCTEpWwLe3Jc4yZ3C9a23fSkT3It1IoCCQGYovZZCx+FhLpE4U9qEDRK8Au4
DHCyDjLnD3tiREghOj1ubm0BK92qgqDRY2A29QIIMjec0wBZ2j+UVDEoFfQR
g8fATARcJgYBEgUrgQQAIwQjBAAT5AWJBUHboey4zH+sP4758MPGlk0kHUi4
Jo1wVYmdC+oRURIvAZHbmM+1/rlte/N4cB8K95lE7/O7UL4YiPm4NwGaSKy3
nSbD3bW0LzDSE+Nz7NFXk/OUV+hpgI4dWR4FakM7AlpvlL9HJhtSJDBEXNLL
jRaEQyHmALEQ/DKufmTSowMBCgn+CQMISwElDPIehj1g8xGCGcJvoT+UEoSA
dDaZ1JxKmtxiSkU2/is50arUiu2VnC7TFwkgrLlBLd3D70GO2Y6gUEF659lX
xLDk8xULInk35kq213B5vyjV3z8mtO2DHUn4mF/DajOOzb4tg6JEh/yioHP8
5tHCpAQYEwoAEwUCXCYGAQkQHxjvouPk4ysCGwwAAADHAgkB9RIKMyHXk/z2
dLMjLybQV2TISe7SifzPQMIjcJibd4iZM9eX26Df7pJDerHvdAMgdmQx2HiR
N6yYdeEo00lKkPQCCOfFpBVUSJw++GdPsn/eb8eTy/ejexFdOoqz+WBx6bdr
r2tcvYp+ziB9GaDBoCFZGtgtB2QjhevWSzVQhCcV4TPH`;

const TEST_KEY_PAIR: KeyPair = {
    privateKeyArmored: TEST_PRIVATE_KEY,
    publicKeyArmored: TEST_PUBLIC_KEY,
    salt: 'iqlJKKyRFryR6PZ6umx/ie',
    iterations: 10,
};
