import { Component, OnInit } from '@angular/core';
import { Encrypter, TEST_KEY_PAIR } from '../../services/encrypter';
import { EtchedApiService } from '../../services/etched-api.service';
import { sliceStr } from '../../utils/text-utils';

@Component({
    selector: 'app-entry',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.css']
})
export class EntryComponent implements OnInit {

    initializingEncrypter: boolean;
    encrypter: Encrypter;

    plaintext: string;
    ciphertext: string;
    decryptedPlaintext: string;

    constructor(public etchedApi: EtchedApiService) {
    }

    ngOnInit() {
        this.initializingEncrypter = true;
        this.plaintext = 'the quick brown fox jumps over the lazy dog';
        this.initEncrypter();
    }

    initEncrypter() {
        Encrypter.from(TEST_KEY_PAIR, 'passphrase')
            .then(e => {
                this.encrypter = e;
                this.initializingEncrypter = false;
            });
    }

    onSubmit() {
        this.encrypter.encrypt(this.plaintext)
            .then(ciphertext => {
                return this.etchedApi.createEntry(ciphertext);
            })
            .then(resp => {
                resp.subscribe(entry => {
                    this.ciphertext = sliceStr(entry.content, 30).join('\n');
                    this.decodeCiphertext(entry.content);
                });
            })
    }

    private decodeCiphertext(ciphertext: string) {
        this.encrypter.decrypt(ciphertext)
            .then(plaintext => {
                this.decryptedPlaintext = plaintext;
            })
    }
}
