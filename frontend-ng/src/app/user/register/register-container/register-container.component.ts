import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../../../services/etched-api.service';
import { RegisterRequest } from '../../../services/dtos/register-request';
import { Encrypter, KeyPair } from '../../../services/encrypter';
import * as openpgp from 'openpgp';
import { EncrypterService } from '../../../services/encrypter.service';
import { Base64Str } from '../../../models/encrypted-entity';
import { AuthService, UsernameTakenError } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';

@Component({
    selector: 'app-register-container',
    templateUrl: './register-container.component.html',
    styleUrls: ['./register-container.component.css']
})
export class RegisterContainerComponent implements OnInit {

    NOT_REGISTERED = 'NOT_REGISTERED';
    REGISTERING = 'REGISTERING';
    USERNAME_TAKEN = 'USERNAME_TAKEN';
    ENTERING_PASSPHRASE = 'ENTERING_PASSPHRASE';
    CREATING_KEYS = 'CREATING_KEYS';
    UPLOADING_KEYS = 'UPLOADING_KEYS';
    UPLOADED_KEYS = 'UPLOADED_KEYS';

    registerState: string;

    /**
     * Used by RegisterComponent to display the username if they attempt to register with a
     * taken username.
     */
    username: string;

    constructor(private etchedApi: EtchedApiService,
                private encrypterService: EncrypterService,
                private authService: AuthService,
                private router: Router) {
        this.registerState = this.NOT_REGISTERED;
    }

    ngOnInit() {
    }

    onRegister(req: RegisterRequest) {
        console.info(`Registering ${req.username}`);
        this.registerState = this.REGISTERING;

        this.authService.register(req.username, req.password)
            .then(() => {
                this.registerState = this.ENTERING_PASSPHRASE;
            })
            .catch(e => {
                if (e.message === UsernameTakenError.MESSAGE) {
                    this.registerState = this.USERNAME_TAKEN;
                }
                this.username = req.username;
            });
    }

    onPassphraseConfigured(passphrase: string) {
        this.registerState = this.CREATING_KEYS;
        let keyPair: KeyPair;

        // 1. Generate the key pair
        this.generateKey(passphrase)
            // 2. Create the encrypter
            .then((k: KeyPair) => {
                keyPair = k;
                return this.createEncrypter(k, passphrase);
            })
            // 3. Upload the key pair
            .then((encrypter: Encrypter) => {
                const privateKeyBytes = encrypter.privateKeyEncrypted.toPacketlist().write();
                const privateKeyStr = openpgp.util.Uint8Array_to_b64(privateKeyBytes);

                const publicKeyBytes = encrypter.publicKeys[0].toPacketlist().write();
                const publicKeyStr = openpgp.util.Uint8Array_to_b64(publicKeyBytes);
                this.uploadKeyPair(privateKeyStr, publicKeyStr, keyPair.salt, keyPair.iterations);
            });
    }

    /**
     * Generate a PGP key protected with the given passphrase
     * @param passphrase
     */
    generateKey(passphrase: string): Promise<KeyPair> {
        this.registerState = this.CREATING_KEYS;
        if (this.authService.getUser() === null) {
            throw new Error('Attempted to generate key without being logged in');
        }
        return Encrypter.generateKey(passphrase, this.authService.getUser().id);
    }

    /**
     * Create an encrypter to protect the
     * @param keyPair
     * @param passphrase
     */
    createEncrypter(keyPair: KeyPair, passphrase: string): Promise<Encrypter> {
        return Encrypter.from(keyPair, passphrase)
            .then(enc => {
                // Assign the encrypter to the encrypter service so other modules can use it
                this.encrypterService.encrypter = enc;
                return enc;
            });
    }

    /**
     * Uploads the key pair details to the backend
     */
    uploadKeyPair(privateKey: Base64Str, publicKey: Base64Str, salt: string, iterations: number) {
        this.registerState = this.UPLOADING_KEYS;
        this.etchedApi.createKeyPair({publicKey, privateKey, salt, iterations})
            .subscribe(result => {
                this.encrypterService.encrypter.keyPairId = result.id;
                // navigate to journal creation page once registered
                // noinspection JSIgnoredPromiseFromCall
                this.router.navigate([EtchedRoutes.JOURNALS_CREATE_PATH]);
                this.registerState = this.UPLOADED_KEYS;
            });
        // TODO: Handle error
    }
}
