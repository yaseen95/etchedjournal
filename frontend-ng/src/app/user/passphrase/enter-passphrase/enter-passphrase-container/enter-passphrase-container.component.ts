import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EtchedRoutes } from '../../../../app-routing-utils';
import { KeyPairEntity } from '../../../../models/key-pair-entity';
import { Encrypter, IncorrectPassphraseError } from '../../../../services/encrypter';
import { EncrypterService } from '../../../../services/encrypter.service';
import { KeyPairsService } from '../../../../services/key-pairs.service';

@Component({
    selector: 'app-enter-passphrase-container',
    templateUrl: './enter-passphrase-container.component.html',
    styleUrls: ['./enter-passphrase-container.component.css']
})
export class EnterPassphraseContainerComponent implements OnInit {

    DOWNLOADING_KEYS = 'DOWNLOADING_KEYS';
    ENTERING_PASSPHRASE = 'ENTERING_PASSPHRASE';
    DECRYPTING_KEYS = 'DECRYPTING_KEYS';
    DECRYPTED_KEYS = 'DECRYPTED_KEYS';

    /** Current state of login process */
    state: string;

    keyPair?: KeyPairEntity;
    passphraseIncorrect: boolean;
    redirectTo: string;

    constructor(private encrypterService: EncrypterService,
                private keyPairsService: KeyPairsService,
                private route: ActivatedRoute,
                private router: Router
    ) {
        this.state = this.DOWNLOADING_KEYS;
        let next = route.snapshot.queryParamMap.get('next');
        if (next === null) {
            next = EtchedRoutes.JOURNALS_PATH;
        }
        this.redirectTo = next;
    }

    ngOnInit() {
        this.downloadKeys();
    }

    downloadKeys() {
        return this.keyPairsService.getKeyPairs()
            .subscribe(keys => {
                if (keys.length === 0) {
                    return this.router.navigate([EtchedRoutes.KEYS_GENERATE_PATH]);
                }
                if (keys.length > 1) {
                    throw new Error(`Expected only one key but got ${keys.length} keys`);
                }
                this.keyPair = keys[0];
                this.state = this.ENTERING_PASSPHRASE;
            });
    }

    onPassphraseConfigured(passphrase: string) {
        this.state = this.DECRYPTING_KEYS;
        this.decryptKeyPair(passphrase)
            .then(() => {
                console.info('Decrypted keys');
                this.state = this.DECRYPTED_KEYS;
                this.passphraseIncorrect = false;
                this.router.navigate([this.redirectTo]);
            })
            .catch(error => {
                if (error.message === IncorrectPassphraseError.MESSAGE) {
                    console.info(IncorrectPassphraseError.MESSAGE);
                    this.passphraseIncorrect = true;
                    this.state = this.ENTERING_PASSPHRASE;
                } else {
                    // TODO: Display an internal error so users can handle this
                    console.error(error);
                    throw error;
                }
            });
    }

    decryptKeyPair(passphrase: string): Promise<void> {
        console.info('Decrypting private key');

        return Encrypter.from2(
            this.keyPair.privateKey,
            this.keyPair.publicKey,
            passphrase,
            this.keyPair.id,
            this.keyPair.salt,
            this.keyPair.iterations
        ).then((encrypter: Encrypter) => {
            this.encrypterService.encrypter = encrypter;
        });
    }
}
