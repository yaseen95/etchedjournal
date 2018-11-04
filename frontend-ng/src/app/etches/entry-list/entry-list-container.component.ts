import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../../services/etched-api.service';
import { EntryEntity } from '../../models/entry-entity';
import { Encrypter, TEST_KEY_PAIR } from '../../services/encrypter';
import { forkJoin, from } from 'rxjs';
import { Base64Str } from '../../models/encrypted-entity';
import { EncrypterService } from '../../services/encrypter.service';

@Component({
    selector: 'app-entry-list-container',
    templateUrl: './entry-list-container.component.html',
    styleUrls: ['./entry-list-container.component.css']
})
export class EntryListContainerComponent implements OnInit {

    inFlight: boolean;

    decrypting: boolean;

    entries: EntryEntity[];

    fetchedEntries: boolean;

    encrypter?: Encrypter;

    constructor(private etchedApi: EtchedApiService,
                private encrypterService: EncrypterService) {
        this.inFlight = true;
        this.decrypting = false;
        this.fetchedEntries = false;
        this.entries = [];
        if (encrypterService.encrypter === null) {
            throw new Error('Expected encrypter to not be null');
        }
        console.info(encrypterService.encrypter);
        this.encrypter = encrypterService.encrypter;
    }

    ngOnInit() {
        // Get the entries once the component is initialized
        this.etchedApi.getEntries()
            .subscribe(entries => {
                console.info('Starting decryption of entries');
                this.inFlight = false;
                this.decrypt(entries)
            });
    }

    decrypt(encryptedEntries: EntryEntity[]) {
        // Create a copy of the encryptedEntries
        const decrypted: EntryEntity[] = encryptedEntries.slice(0);

        const decryptionPromises = [];
        encryptedEntries.map(entry => {
            decryptionPromises.push(this.encrypter.decrypt(entry.content));
        });

        // TODO: Decrypt entries individually and show progress for each entry
        Promise.all(decryptionPromises)
            .then((decryptedEntries: Base64Str[])=> {
                console.info(`Decrypted ${decryptedEntries.length} entries`);
                decryptedEntries.forEach((decResult, index) => {
                    // Update the entry with the decrypted result
                    decrypted[index].content = decResult;
                });
                this.entries = decrypted;
                this.decrypting = false;
            });
    }
}
