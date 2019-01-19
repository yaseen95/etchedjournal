import * as bcrypt from 'bcryptjs';
import * as openpgp from 'openpgp';
import { DecryptOptions, EncryptOptions, UserId } from 'openpgp';
import { environment } from '../../environments/environment';
import { Base64Str } from '../models/encrypted-entity';

const DEFAULT_CURVE = 'p521';

const DEFAULT_STRETCHING_ROUNDS: number = 10;

if (!environment.test) {
    openpgp.initWorker({path: 'assets/openpgp.worker.min.js'});
}

// TODO: Can we return Observables instead of Promises?
// Would make it more consistent with the API
export class Encrypter {

    private constructor(
        public privateKey: openpgp.key.Key,
        // TODO: Do we expect more than one public key?
        public publicKeys: openpgp.key.Key[],
        // The passphrase protected version of the key
        public privateKeyEncrypted: openpgp.key.Key,
        /** id of key pair */
        public keyPairId: string | null = null
    ) {
    }

    /**
     * Generate a PGP key
     * @param passphrase    passphrase to protect private key with
     * @param userId        id of user generating the key, (explicitly id not the userId)
     */
    public static async generateKey(passphrase: string, userId: string): Promise<KeyPair> {
        const key = await this.stretchNewPassphrase(passphrase);

        const keyOptions: openpgp.KeyOptions = {
            date: new Date(),
            // Specify curve to use ECC
            curve: DEFAULT_CURVE,
            // Specify numbits to use RSA
            // numBits: DEFAULT_RSA_BITS,
            passphrase: key.hash,
            userIds: [this.createUserId(userId)],
        };

        const generated = await openpgp.generateKey(keyOptions);
        return {
            salt: key.salt,
            iterations: key.iterations,
            privateKeyArmored: generated.privateKeyArmored,
            publicKeyArmored: generated.publicKeyArmored,
        };
    }

    private static async stretchNewPassphrase(passphrase: string): Promise<StretchedKey> {
        const rounds = DEFAULT_STRETCHING_ROUNDS;
        let salt = await bcrypt.genSalt(rounds);
        const hash = await bcrypt.hash(passphrase, salt);
        // slice by 7 to remove the '$2a$10$'
        salt = salt.slice(7);
        return {salt, iterations: rounds, hash};
    }

    private static async stretchPassphrase(
        passphrase: string,
        salt: string,
        iterations: number
    ): Promise<string> {
        // bcrypt string is made up of the following parts
        //  2a - identifier of bcrypt
        //  10 - number of rounds
        //  salt
        //  hash
        // the parts are separated by '$'
        const bcryptSalt = `$2a$${iterations}$${salt}`;
        return await bcrypt.hash(passphrase, bcryptSalt);
    }

    /**
     * Instantiate an Encrypter from a key pair and passphrase
     * @param keyPair       public/private key pair
     * @param passphrase    passphrase used to protect the private key
     */
    public static async from(keyPair: KeyPair, passphrase: string): Promise<Encrypter> {
        const keyResult = await openpgp.key.readArmored(keyPair.privateKeyArmored);
        const privateKey = keyResult.keys[0];

        // copy the private key (before decrypting it)
        const privateKeyEncrypted = await Encrypter.copyKey(privateKey);
        await Encrypter.decryptPrivateKey(privateKey, passphrase, keyPair.salt, keyPair.iterations);

        const publicKeys = (await openpgp.key.readArmored(keyPair.publicKeyArmored)).keys;
        return new Encrypter(privateKey, publicKeys, privateKeyEncrypted);
    }

    // TODO: Update this name
    // What is from2?
    public static async from2(privKey: Base64Str,
                              pubKey: Base64Str,
                              passphrase: string,
                              keyPairId: string,
                              salt: string,
                              iterations: number
    ): Promise<Encrypter> {
        const privBytes = openpgp.util.b64_to_Uint8Array(privKey);
        const pubBytes = openpgp.util.b64_to_Uint8Array(pubKey);

        const privateKey: openpgp.key.Key = (await openpgp.key.read(privBytes)).keys[0];
        const publicKeys: openpgp.key.Key[] = (await openpgp.key.read(pubBytes)).keys;

        // copy the private key (before decrypting it)
        const privateKeyEncrypted = await Encrypter.copyKey(privateKey);
        await Encrypter.decryptPrivateKey(privateKey, passphrase, salt, iterations);

        return new Encrypter(privateKey, publicKeys, privateKeyEncrypted, keyPairId);
    }

    private static async decryptPrivateKey(
        privateKey: openpgp.key.Key,
        passphrase: string,
        salt: string,
        iterations: number
    ): Promise<void> {
        try {
            const hashedPassphrase = await this.stretchPassphrase(passphrase, salt, iterations);
            // TODO: Add test for this
            // This decrypts the key in place, it doesn't return anything
            await privateKey.decrypt(hashedPassphrase);
        } catch (e) {
            if (e.message === 'Incorrect key passphrase') {
                console.info('Passphrase is incorrect');
                throw new IncorrectPassphraseError();
            } else {
                console.error(`Unexpected error when decrypting key ${JSON.stringify(e)}`);
                throw e;
            }
        }
    }

    /**
     * Creates a copy of a key
     */
    private static async copyKey(key: openpgp.key.Key): Promise<openpgp.key.Key> {
        const keys = (await openpgp.key.read(key.toPacketlist().write())).keys;
        if (keys.length !== 1) {
            throw new Error(`Unexpected number of keys ${keys.length}`);
        }
        return keys[0];
    }

    /**
     * Symmetrically encrypt the plaintext using the specified password
     * @param plaintext plaintext to encrypt
     * @param password  password to use to encrypt the plaintext
     */
    public static async symmetricEncrypt(plaintext: string, password: string): Promise<Base64Str> {
        const options: EncryptOptions = {
            message: openpgp.message.fromText(plaintext),
            passwords: password
        };

        return this.encryptAsBytes(options);
    }

    /**
     * Symmetrically decrypt the ciphertext using the specified password
     * @param ciphertext  the ciphertext to decrypt
     * @param password    password used to decrypt the ciphertext
     */
    public static async symmetricDecrypt(ciphertext: Base64Str, password: string): Promise<string> {
        const bytes = openpgp.util.b64_to_Uint8Array(ciphertext);
        const msg = await openpgp.message.read(bytes);

        const options: DecryptOptions = {
            message: msg,
            passwords: password
        };

        return this.decryptAsString(options);
    }

    /**
     * Creates a `UserId` from the id of a user
     * @param userId the of the user (uuid)
     */
    static createUserId(userId: string): UserId {
        return {name: userId, email: `${userId}@users.etchedjournal.com`};
    }

    private static async encryptAsBytes(options: EncryptOptions): Promise<Base64Str> {
        const ciphertext = await openpgp.encrypt(options);

        // ciphertext is a Message that contains the ciphertext as a string
        // we read it back in and copy it to a new Message we can access it as binary data
        const armoredMsg = await openpgp.message.readArmored(ciphertext.data) as any;

        // Get the packets and convert it to a base 64 encoded string
        const pgpPackets: ReadableStream = armoredMsg.packets.write();
        const bytes: Uint8Array = await openpgp.stream.readToEnd(pgpPackets);
        return openpgp.util.Uint8Array_to_b64(bytes);
    }

    private static async decryptAsString(options: DecryptOptions): Promise<string> {
        let decrypted;
        try {
            decrypted = await openpgp.decrypt(options);
        } catch (e) {
            if (options.passwords &&
                e.message === 'Error decrypting message: Session key decryption failed.') {
                throw new Error('Password is incorrect');
            }
            throw e;
        }
        return await openpgp.stream.readToEnd(decrypted.data);
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
        const options: EncryptOptions = {
            // Message to encrypt
            message: await openpgp.message.fromText(message),
            // Specify private key so it can be used to sign the payload
            privateKeys: [this.privateKey],
            // Specify key to encrypt the data
            publicKeys: this.publicKeys,
            compression: openpgp.enums.compression.zip,
        };

        return Encrypter.encryptAsBytes(options);
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
        const bytes = openpgp.util.b64_to_Uint8Array(encoded);
        const msg = await openpgp.message.read(bytes);

        const decryptOptions: DecryptOptions = {
            message: msg,
            privateKeys: this.privateKey,
            // We specify the keys here so that we can verify that the we encrypted this message
            publicKeys: this.publicKeys,
        };

        const decrypted = await openpgp.decrypt(decryptOptions);
        if (decrypted.signatures.length === 0) {
            throw new Error('Decrypted message is unsigned');
        }
        return await openpgp.stream.readToEnd(decrypted.data);
    }
}

export class PgpError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class IncorrectPassphraseError extends PgpError {
    public static MESSAGE = 'Passphrase is incorrect';

    constructor() {
        super(IncorrectPassphraseError.MESSAGE);
    }
}

export interface StretchedKey {
    /** salt used as input into the key stretcher */
    readonly salt: string;

    /** number of iterations to perform during stretching */
    readonly iterations: number;

    /** output hash of stretching operation */
    readonly hash: string;
}

export interface KeyPair {
    readonly privateKeyArmored: string;
    readonly publicKeyArmored: string;

    /** salt used as input into the key stretcher */
    readonly salt: string;

    /** number of iterations to perform during stretching */
    readonly iterations: number;
}
