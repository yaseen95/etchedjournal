import { async, TestBed } from '@angular/core/testing';
import { Encrypter, TEST_KEY_PAIR } from './encrypter';

import * as openpgp from 'openpgp';

describe('Encrypter', () => {

    let encrypter: Encrypter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({});
        Encrypter.from(TEST_KEY_PAIR, 'passphrase')
            .then(enc => encrypter = enc);
    }));

    it('should create encrypter', () => {
        expect(encrypter).toBeDefined();
    });

    it('encrypt and decrypt', async(() => {
        encrypter.encrypt('test data')
            .then(ciphertext => {
                // PGP encryption uses random keys so we can assert the message is valid
                expect(ciphertext).not.toEqual('test data');
                return encrypter.decrypt(ciphertext);
            })
            .then(decrypted => {
                expect(decrypted).toEqual('test data');
            });
    }));

    it('decrypt existing message', async(() => {
        encrypter.decrypt(TEST_DATA_ENCRYPTED_AND_SIGNED)
            .then(decrypted => {
                expect(decrypted).toEqual('test data');
            });
    }));

    it('decrypt unsigned message fails', async(() => {
        encrypter.decrypt(TEST_DATA_ENCRYPTED_UNSIGNED)
            .then(decrypted => {
                expect(decrypted).toEqual('test data');
            })
            .catch(error => {
                expect(error.message).toEqual('Decrypted message is unsigned');
            });
    }));

    it('symmetric encrypt and decrypt', async(() => {
        Encrypter.symmetricEncrypt('plaintext data', 'password')
            .then(ciphertext => {
                return Encrypter.symmetricDecrypt(ciphertext, 'password');
            })
            .then(decrypted => {
                expect(decrypted).toEqual('plaintext data');
            });
    }));

    it('symmetric decrypt existing message', async(() => {
        Encrypter.symmetricDecrypt(TEST_DATA_SYMMETRICALLY_ENCRYPTED, 'password')
            .then(decrypted => {
                expect(decrypted).toEqual('test data');
            });
    }));

    it('symmetric decrypt with incorrect password fails', async(() => {
        Encrypter.symmetricDecrypt(TEST_DATA_SYMMETRICALLY_ENCRYPTED, 'PASSWORD')
            .then(decrypted => {
                expect(decrypted).toEqual('plaintext data');
            })
            .catch(error => {
                expect(error.message).toEqual('Password is incorrect');
            });
    }));

    it('user id generation', async(() => {
        const actual = Encrypter.createUserId('samsepiol');
        expect(Object.keys(actual).length).toEqual(2);
        expect(actual.email).toEqual('samsepiol@users.etchedjournal.com');
        expect(actual.name).toEqual('samsepiol');
    }));

    it('base 64 encoding utils', () => {
        const array = new Uint8Array([5, 6, 7, 8]);
        const actual = openpgp.util.Uint8Array_to_b64(array);
        expect(actual).toEqual('BQYHCA==');
    });

    it('read private key', async(() => {
        const privBytes = openpgp.util.b64_to_Uint8Array(TEST_PRIVATE_KEY);
        openpgp.key.read(privBytes)
            .then(keys => {
                expect(keys.keys.length).toEqual(1);
                expect(keys.keys[0].isPrivate).toBeTruthy();
            });
    }));
});

/** the message 'test data' encrypted via pgp (public private mode) */
const TEST_DATA_ENCRYPTED_AND_SIGNED =
    `wcBMAxZhtTVFVmdVAQf5AZ0oNLVK2mtnMAkV6kf4s3x3xNkMQN3cKhsQXsPi
h9SXBkREWtbbCGiXvLWgmwRLqi7PGvRz6HMTiF5ApDGlBBvubCXzEADohHEP
zauLnzEPD9et2ZPq50VgMEnWK8BuZQC+TJ2mzRn5FTzfVcfl4mq6QzKTVczD
cFE+RvEJ6tXjvR5k/T9NpCsL9GKy/zfYVTPyqD26WzNmj4L4LcuW57BrUbsf
Rx/DZZEmS+ZqJln2vHrAZNyuDmM+MxOtdUGEy6WSLvqihRgLJSOht3642kMm
YaR3aVs2MOxxd2bkGot2lbgxeuBQ3YUv6oteoz5Uq7YbtF8o1IN7zZ0FT4Se
fNLArwGhpLsov8XuK/iKL3nNd66pLnhSpkFF1vtje8jrDNDLQK3kC7Da5CxT
SwSzhyaTmRJCDFIJOWKIpfkR996UIytoLKuOp+APpS6spTdBgFSoWdDJaDTF
WPatE1eApU+sg9YRd6L0jD+gyTS3qMvd3zo9rwEMsL5yyNCP0ftYo6Xd9K/e
Hm4fkmNWKL5HkoTWYGnyG0jFUesrtU55U3BIuMcdhoZrqtJBAVD6Z7/LMzOB
SgWB43TUsFNi6yglKuZzjf24PQ4t0DKMEEgZPNSDhnc6nxXC5c6N4G+yVtTK
KzCmAraKABNGE2J9LHUBYJnih71SfP/Nek365nO7oDM7L2xqtS5gskynxkJy
iXhQ/27pYPb2DVieDKjagcLUZZX53BfJj6Z14BpNYYc0BJ4R27Wn1ftHJsz2
2G12f40Vpnaqwlb0Bg7JZLFfGDKNFcrtaM2vKPD+qrZnXIkrEWPSMiDDvjGw
OMyNifV4y03JQc0=`;

/** the message 'test data' encrypted but not signed with the private key */
const TEST_DATA_ENCRYPTED_UNSIGNED =
    `wcBMAxZhtTVFVmdVAQf/YmOWipDCdHwmqAGSPF0PlWEF2fetYpUjY+XIKvmw
F+oFaO579BfON4nUA+uQxV9GNDwmy9jb3VLBjj6L2UfWlJS40criyJ7C52oO
dMqhDDK8Vq1N4bKmeQURIlkdDH+qxSprXS0Xih5pn+KVcMR/83Bm/9CIpQHN
StLs3IzyoclZd0Wub7y0eYnnGG+pRbvf9Br5X1MxQucx45eOs0RV0GeOUHFu
iMFjt5kWOV7+F4/dGZU/RqGoIWZ1B2yxhWQVUXyKd5Ow7+oLZKad45EtRCnr
So+y+ZmideIIMBsm+uTU+xDA/jmrJJD0X+kbkk8LcQa4JXcg15NVEBg8wI6a
vdJBAZI91WQflGRqV5Mqx36+lcLFDWo2Yi1ghbCumepjxzot3Jizd//vjVh/
300jLHq9303JiDj1U3U7CicHxdTd7/k=`;

const TEST_DATA_SYMMETRICALLY_ENCRYPTED =
    `wy4ECQMIXo+rdaah8y1gZ4y3YheRV06CBUsLrUpcpNXXq8PIvrYrnCQxiuyh
Ld7b0kEBzPByJMMVhKXKNusjugSzlBKHVOAShh+IOfcUSkOcXyx54N3UquA0
vFPuY717NmO5f8gHzsCufXe+bIBySp3FwA==`;

const TEST_PUBLIC_KEY =
    `xsBNBFvMGtIBCADdRNZrq8JNgl5o+QKyxTAe0VxSB7ShCxRWsYKlZDvonxBG
8l5075Xt1dwoJLn5xmvy8gGObQAxx35GWgv10pdVemCNoPlC1l4Xf+DRa1sF
FKiyvKheL9mworCbMHihwSntFSsmsqkvwB1sAd4mHS0jxQx7rQVUFCxoUgNI
KkpIXe0j+oTW8w7h+CBvbJxcjtGss3VkvQ8+dH0Fe23XuOjJkRnAlm6ZZEc5
eHpBqFEreF/GVQTwNAijt80WQR2IusjvYknWmtHEy1PULINtR+NOuRd4mbuA
JFe9tFEbFvqDIUbpPHPXtiuR3e6UtV3LHTcU20YiY291tgeLMk4PBkGVABEB
AAHNG3Rlc3RlciA8dGVzdGVyQGV4YW1wbGUuY29tPsLAdQQQAQgAKQUCW8wa
0gYLCQcIAwIJEGyOiOnh1LiZBBUICgIDFgIBAhkBAhsDAh4BAACdoAgAiT1z
wVYoY2iIK8IhkFhxSSNxG4koej2mGvkOZ6L6ELadfUIdQNoEvQ7p5qemi2Vy
dH35IB6VUtsInbf2jifgCbgiehvDkllRCtkHr+BpQRHTQapOmjduMsEt4zRM
XMpY8iE5W+7mYrDMRdI7YVuMeYhS6R/kSIokqrPJfm6zreI2dEUpNJFZ8GSX
GveETF6qj2kv7ZsJoGUNDrJLBYG1QLBZaOZ5khki6F3NbniGTK/C8A2XPrOp
I8rQSiKf7WxHBkfEsXPS4dCJmBeUMmdVUNjud0jZRAnzPDh9x3N6VsY8gW+G
FMB8vQkmnu7WhtihWdEqkz19jw7a9f/flSxPE87ATQRbzBrSAQgApohK0p09
p1KTBgBaQMbGNOd8WOtBOK3HsdBkn0S8YqUq4w3aSCghZstIziZTkhaL6Z6J
lY5tG6dKi+oadMZgqz19UxSNLLJxyV2GT9YuSb2ZZa5iBJ7lQLhQ5DWL8Vk7
Cs9cpLKlWUnGQO99MEOWP8tsrrG7Lig1Sgae0XPQIKdjVeKf5UZoEdy/3tmZ
HSe7mluNUcsXQ3hVrEazt3qVvZ/pOhExuMiB+kOKQ81QAiqa4KK1RDcx+8j7
FamC7bXh41dOKKXImrP9ZqNJfvlynw5ID1deNzcfdeNua508sMWWtQQZ/Kqc
6eggvdbpi1Yent0FWKHn8lcIIhs2DA4xHQARAQABwsBfBBgBCAATBQJbzBrS
CRBsjojp4dS4mQIbDAAAMpUH/ioyfKNtJy/k76Wj7kPy+aolWS770fdOK5uI
ndgTQ/Mwv/tds+8Z0xEX8yFHKJWY+NT9acTSHLzzIoRAphko6bbUUUSbsmwM
aVCsvWMx1qkOY/zFx9A9G0OGsT4MMAgPT1dyA7Np6eO3CKo80TKMhlgaMEDS
aCz+rnHSOFmM1zR0GGPVILfNNEgiqUDX9z+jNzAJc9pwvrPRlvuvxm0DHADm
t1rcKdmdy7UVrnoCAjyyIa77aYxnV/odr1t0o0hxczXnG7JP3za2M+B0/2oB
oTvl8t5wwEWqi1CRxkr9J1OhRXmRkdAVCt/8GtiomTkz+fBIBpaPAEUNDFdq
zwqEoYA=`;

const TEST_PRIVATE_KEY =
    `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
CoShgA==`;
