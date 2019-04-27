import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as openpgp from 'openpgp';
import { EtchedRoutes } from '../../app-routing-utils';
import { AuthService } from '../../services/auth.service';
import { Encrypter, KeyPair } from '../../services/encrypter';
import { EncrypterService } from '../../services/encrypter.service';
import { KeyPairService } from '../../services/key-pair.service';
import { Base64Str } from '../../services/models/types';

@Component({
    selector: 'app-generate',
    templateUrl: './generate-container.component.html',
    styleUrls: ['./generate-container.component.css'],
})
export class GenerateContainerComponent {
    public ENTERING_PASSPHRASE = 1;
    public CREATING_KEYS = 2;
    public UPLOADING_KEYS = 3;
    public UPLOADED_KEYS = 4;

    public state: number;
    @Output()
    public keyPairEmitter: EventEmitter<KeyPair>;

    constructor(
        private encrypterService: EncrypterService,
        private authService: AuthService,
        private keyPairService: KeyPairService,
        private router: Router
    ) {
        this.state = this.ENTERING_PASSPHRASE;
    }

    public onPassphraseConfigured(passphrase: string) {
        this.state = this.CREATING_KEYS;
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
     */
    private generateKey(passphrase: string): Promise<KeyPair> {
        this.state = this.CREATING_KEYS;
        return Encrypter.generateKey(passphrase, this.authService.getUser().id);
    }

    /**
     * Create an encrypter to protect the
     */
    private createEncrypter(keyPair: KeyPair, passphrase: string): Promise<Encrypter> {
        return Encrypter.from(keyPair, passphrase).then(enc => {
            // Assign the encrypter to the encrypter service so other modules can use it
            this.encrypterService.encrypter = enc;
            return enc;
        });
    }

    /**
     * Uploads the key pair to the backend
     */
    private uploadKeyPair(
        privateKey: Base64Str,
        publicKey: Base64Str,
        salt: string,
        iterations: number
    ) {
        this.state = this.UPLOADING_KEYS;
        this.keyPairService
            .createKeyPair({ publicKey, privateKey, salt, iterations })
            .subscribe(result => {
                this.encrypterService.encrypter.keyPairId = result.id;
                // navigate to journal creation page once they key pair has been created
                // noinspection JSIgnoredPromiseFromCall
                this.router.navigate([EtchedRoutes.JOURNALS_CREATE_PATH]);
                this.state = this.UPLOADED_KEYS;
            });
        // TODO: Handle error
    }
}
