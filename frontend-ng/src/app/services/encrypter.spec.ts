import { async, TestBed } from '@angular/core/testing';
import { Encrypter, TEST_KEY_PAIR } from './encrypter';

import * as openpgp from 'openpgp';
import { userInfo } from 'os';

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
            })
    }));

    it('symmetric encrypt and decrypt', async(() => {
        Encrypter.symmetricEncrypt('plaintext data', 'password')
            .then(ciphertext => {
                return Encrypter.symmetricDecrypt(ciphertext, 'password');
            })
            .then(decrypted => {
                expect(decrypted).toEqual('plaintext data');
            })
    }));

    it('symmetric decrypt existing message', async(() => {
        Encrypter.symmetricDecrypt(TEST_DATA_SYMMETRICALLY_ENCRYPTED, 'password')
            .then(decrypted => {
                expect(decrypted).toEqual('test data');
            })
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
