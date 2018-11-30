import { Component, OnInit } from '@angular/core';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchedApiService } from '../../../services/etched-api.service';
import { KeyPairEntity } from '../../../models/key-pair-entity';
import { switchMap } from 'rxjs/operators';
import { Encrypter, IncorrectPassphraseError } from '../../../services/encrypter';
import { LoginRequest } from '../../../services/dtos/login-request';
import { Base64Str } from '../../../models/encrypted-entity';

@Component({
    selector: 'app-login-container',
    templateUrl: './login-container.component.html',
    styleUrls: ['./login-container.component.css']
})
export class LoginContainerComponent implements OnInit {

    NOT_LOGGED_IN = 'NOT_LOGGED_IN';
    LOGGING_IN = 'LOGGING_IN';
    DOWNLOADING_KEYS = 'DOWNLOADING_KEYS';
    ENTERING_PASSPHRASE = 'ENTERING_PASSPHRASE';
    DECRYPTING_KEYS = 'DECRYPTING_KEYS';
    DECRYPTED_KEYS = 'DECRYPTED_KEYS';

    /** Current state of login process */
    loginState: string;

    keyPair?: KeyPairEntity;
    loginPassword?: string;
    passphraseIncorrect: boolean;

    constructor(private encrypterService: EncrypterService,
                private etchedApiService: EtchedApiService) {
        // TODO: Try to pull token data from localstorage
        this.loginState = this.NOT_LOGGED_IN;
        this.passphraseIncorrect = false;
    }

    ngOnInit() {
    }

    /**
     * Responds to login requests emitted by {@link LoginComponent.loginEmitter}
     * @param loginRequest
     */
    onLogin(loginRequest: LoginRequest) {
        this.loginState = this.LOGGING_IN;
        this.etchedApiService.login(loginRequest.username, loginRequest.password)
            .pipe(
                switchMap(() => {
                    // Immediately start downloading keys after successfully logging in
                    this.loginState = this.DOWNLOADING_KEYS;
                    return this.etchedApiService.getKeyPairs();
                }),
            )
            .subscribe(keys => {
                // TODO-HIGH: If zero keys create a key pair
                if (keys.length !== 1) {
                    throw new Error(`Expected only one key but got ${keys.length} keys`);
                }
                this.keyPair = keys[0];

                // Set loginPassword after we have successfully logged in
                this.loginPassword = loginRequest.password;
                this.loginState = this.ENTERING_PASSPHRASE;
            });
        // TODO-HIGHEST: Handle invalid login credentials
    }

    onPassphraseConfigured(passphrase: string) {
        this.loginState = this.DECRYPTING_KEYS;
        this.decryptKeyPair(passphrase)
            .then(() => {
                console.info('Decrypted keys');
                this.loginState = this.DECRYPTED_KEYS;
                this.passphraseIncorrect = false;
            })
            .catch(error => {
                if (error.message === IncorrectPassphraseError.MESSAGE) {
                    console.info(IncorrectPassphraseError.MESSAGE);
                    this.passphraseIncorrect = true;
                    this.loginState = this.ENTERING_PASSPHRASE;
                } else {
                    // TODO: Display an internal error so users can handle this
                    console.error(error);
                    throw error;
                }
            });
    }

    decryptKeyPair(passphrase: string): Promise<void> {
        let encrypter: Encrypter;

        console.info('Decrypting private key');
        return this.decryptPrivateKey()
            .then((decPrivateKey: string) => {
                console.info('Instantiating encrypter');
                return Encrypter.from2(decPrivateKey, this.keyPair.publicKey, passphrase);
            })
            .then((encrypter: Encrypter) => {
                this.encrypterService.encrypter = encrypter;
            });
    }

    private decryptPrivateKey(): Promise<Base64Str> {
        return Encrypter.symmetricDecrypt(this.keyPair.privateKey, this.loginPassword)
            .then(dec => dec)
            .catch(e => {
                throw new Error('Login password was unable to decrypt private key');
            });
    }
}
