import * as openpgp from 'openpgp';
import { DecryptOptions, EncryptedMessage, EncryptOptions, VerifiedMessage } from 'openpgp';
import { Base64Str } from '../models/encrypted-entity';

// TODO: Fix type definitions for openpgp
const openpgpUtil = openpgp.util as any;
const openpgpStream = (openpgp as any).stream;

export class Encrypter {
    /**
     * Generate a PGP key
     * @param passphrase    passphrase to protect private key with
     * @param userId        id of user generating the key, (explicitly id not the username)
     */
    public static async generateKey(passphrase: string, userId: string): Promise<openpgp.KeyPair> {
        const keyOptions: openpgp.KeyOptions = {
            date: new Date(),
            numBits: 4096,
            passphrase: passphrase,
            userIds: [{name: userId, email: `${userId}@user.etchedjournal.com`}],
        };

        return await openpgp.generateKey(keyOptions);
    }

    /**
     * Instantiate an Encrypter from a key pair and passphrase
     * @param keyPair       public/private key pair
     * @param passphrase    passphrase used to protect the private key
     */
    public static async from(keyPair: openpgp.KeyPair, passphrase: string): Promise<Encrypter> {
        const keyResult = await openpgp.key.readArmored(keyPair.privateKeyArmored);
        const privateKey = keyResult.keys[0];

        const decryptResult = await privateKey.decrypt(passphrase);
        if (!decryptResult) {
            console.error('Passphrase is incorrect');
            throw new Error('Passphrase is incorrect');
        } else {
            console.info('Passphrase is correct');
        }

        const publicKeys = (await openpgp.key.readArmored(keyPair.publicKeyArmored)).keys;
        return new Encrypter(privateKey, publicKeys);
    }

    private constructor(
        private privateKey: openpgp.key.Key,
        private publicKeys: openpgp.key.Key[]
    ) {

    }

    /**
     * Encrypts a message
     *
     * The message is encrypted to this user and signed with their private key. Decryption will
     * verifies that this user signed the message.
     *
     * @param message message to encrypt
     * @return the encrypted message as a Base64 encoded string
     */
    public async encrypt(message: string): Promise<Base64Str> {
        const options = {
            // Message to encrypt
            message: await openpgp.message.fromText(message),
            // Specify private key so it can be used to sign the payload
            privateKeys: [this.privateKey],
            // Specify key to encrypt the data
            publicKeys: this.publicKeys,
        };

        const ciphertext = await openpgp.encrypt(options);

        // ciphertext is a Message that contains the ciphertext as a string
        // we read it back in and copy it to a new Message we can access it as binary data
        const armoredMsg = await openpgp.message.readArmored(ciphertext.data) as any;

        // Get the packets and convert it to a base 64 encoded string
        const pgpPackets: ReadableStream = armoredMsg.packets.write();
        const bytes: Uint8Array = await openpgpStream.readToEnd(pgpPackets);
        return openpgpUtil.Uint8Array_to_b64(bytes);
    }

    /**
     * Decrypts an encrypted message
     *
     * Decryption verifies that this user signed the message.
     *
     * @param encoded the base64 encoded ciphertext
     * @return the encrypted message
     */
    public async decrypt(encoded: Base64Str): Promise<string> {
        const bytes = openpgpUtil.b64_to_Uint8Array(encoded);
        const msg = await openpgp.message.read(bytes);

        const decryptOptions: DecryptOptions = {
            message: msg,
            privateKeys: this.privateKey,
            // We specify the keys here so that we can verify that the we encrypted this message
            publicKeys: this.publicKeys,
        };

        const decrypted = await openpgp.decrypt(decryptOptions);
        return await openpgpStream.readToEnd(decrypted.data);
    }

    /**
     * Symmetrically encrypt the plaintext using the specified password
     * @param plaintext plaintext to encrypt
     * @param password  password to use to encrypt the plaintext
     */
    public static async symmetricEncrypt(plaintext: string, password: string): Promise<EncryptedMessage> {
        const options: EncryptOptions = {
            message: openpgp.message.fromText(plaintext),
            passwords: password
        };

        return openpgp.encrypt(options);
    }

    /**
     * Symmetrically decrypt the ciphertext using the specified password
     * @param ciphertext  the ciphertext to decrypt
     * @param password    password used to decrypt the ciphertext
     */
    public static async symmetricDecrypt(ciphertext: string, password: string): Promise<VerifiedMessage> {
        const options: DecryptOptions = {
            message: (await openpgp.message.readArmored(ciphertext)),
            passwords: password
        };

        return openpgp.decrypt(options);
    }
}

const TEST_PRIV_KEY =
    `-----BEGIN PGP PRIVATE KEY BLOCK-----
Version: OpenPGP.js v4.1.1
Comment: https://openpgpjs.org

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
CoShgA==
=dc4v
-----END PGP PRIVATE KEY BLOCK-----`;

const TEST_PUB_KEY =
    `-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: OpenPGP.js v4.1.1
Comment: https://openpgpjs.org

xsBNBFvMGtIBCADdRNZrq8JNgl5o+QKyxTAe0VxSB7ShCxRWsYKlZDvonxBG
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
zwqEoYA=
=pRO3
-----END PGP PUBLIC KEY BLOCK-----`;

export const TEST_KEY_PAIR: openpgp.KeyPair = {
    privateKeyArmored: TEST_PRIV_KEY,
    publicKeyArmored: TEST_PUB_KEY,
    // We have to define this to conform with interface
    // This is not used though
    key: undefined
};
