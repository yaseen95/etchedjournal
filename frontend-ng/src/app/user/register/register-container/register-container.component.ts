import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../../../services/etched-api.service';
import { RegisterRequest } from '../../../services/dtos/register-request';
import { Encrypter } from '../../../services/encrypter';
import * as openpgp from 'openpgp';
import { key, KeyPair } from 'openpgp';
import { switchMap } from 'rxjs/operators';
import { EncrypterService } from '../../../services/encrypter.service';
import { Base64Str } from '../../../models/encrypted-entity';

export namespace RegisterState {
}

@Component({
    selector: 'app-register-container',
    templateUrl: './register-container.component.html',
    styleUrls: ['./register-container.component.css']
})
export class RegisterContainerComponent implements OnInit {

    NOT_REGISTERED = 'NOT_REGISTERED';
    REGISTERING = 'REGISTERING';
    ENTERING_PASSPHRASE = 'ENTERING_PASSPHRASE';
    CREATING_KEYS = 'CREATING_KEYS';
    UPLOADING_KEYS = 'UPLOADING_KEYS';
    UPLOADED_KEYS = 'UPLOADED_KEYS';

    registerState: string;

    /** Stores the password temporarily which is used to encrypt/decrypt the private key */
    password: string;

    constructor(private etchedApi: EtchedApiService,
                private encrypterService: EncrypterService) {
        this.registerState = this.NOT_REGISTERED;
    }

    ngOnInit() {
    }

    onRegister(req: RegisterRequest) {
        console.info(`Registering ${req.username}`);
        this.password = req.password;
        this.registerState = this.REGISTERING;

        console.info('registering');

        // Register first
        this.etchedApi.register(req.username, req.password, req.email)
        // Then login to get access tokens
            .pipe(switchMap(() => this.etchedApi.login(req.username, req.password)))
            .subscribe(() => this.registerState = this.ENTERING_PASSPHRASE);
    }

    onPassphraseConfigured(passphrase: string) {

        this.registerState = this.CREATING_KEYS;

        // 1. Generate the key
        this.generateKey(passphrase)
            // 2. Create the encrypter
            .then((k: KeyPair) => this.createEncrypter(k, passphrase))
            // 3. Encrypt the private key using the login password
            .then((enc: Encrypter) => this.encryptPrivateKey(enc.privateKeyEncrypted))
            // 4. Upload the encrypted keys
            .then((privKeyBase64: Base64Str) => {
                const encrypter = this.encrypterService.encrypter;
                const pub = openpgp.util.Uint8Array_to_b64(encrypter.publicKeys[0].toPacketlist().write());
                this.uploadKeys(privKeyBase64, pub)
            });
    }

    /**
     * Generate a PGP key protected with the given passphrase
     * @param passphrase
     */
    generateKey(passphrase: string): Promise<openpgp.KeyPair> {
        this.registerState = this.CREATING_KEYS;
        if (this.etchedApi.getUser() === null) {
            throw new Error('Attempted to generate key without being logged in');
        }
        return Encrypter.generateKey(passphrase, this.etchedApi.getUser().id)
    }

    /**
     * Create an encrypter to protect the
     * @param keypair
     * @param passphrase
     */
    createEncrypter(keypair: openpgp.KeyPair, passphrase: string): Promise<Encrypter> {
        return Encrypter.from(keypair, passphrase)
            .then(enc => {
                // Assign the encrypter to the encrypter service so other modules can use it
                this.encrypterService.encrypter = enc;
                return enc;
            })
    }

    /**
     * Encrypts the private key with the login password
     * @param privateKey
     */
    encryptPrivateKey(privateKey: key.Key): Promise<Base64Str> {
        const privKey = openpgp.util.Uint8Array_to_b64(privateKey.toPacketlist().write());
        return Encrypter.symmetricEncrypt(privKey, this.password);
    }

    /**
     * Uploads the public and (encrypted) private key to the backend
     * @param privateKey
     * @param publicKey
     */
    uploadKeys(privateKey: Base64Str, publicKey: Base64Str) {
        this.registerState = this.UPLOADING_KEYS;
        this.etchedApi.createKeyPair(publicKey, privateKey)
            .subscribe(result => {
                this.registerState = this.UPLOADED_KEYS;
                this.encrypterService.encrypter.keyPairId = result.id
            });
        // TODO: Handle error
    }
}
