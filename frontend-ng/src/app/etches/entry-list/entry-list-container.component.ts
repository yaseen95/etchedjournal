import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Base64Str } from '../../models/encrypted-entity';
import { EntryEntity } from '../../models/entry-entity';
import { Encrypter } from '../../services/encrypter';
import { EncrypterService } from '../../services/encrypter.service';
import { EntriesService } from '../../services/entries.service';

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

    journalId: string;

    constructor(
        private entriesService: EntriesService,
        private encrypterService: EncrypterService,
        private route: ActivatedRoute
    ) {
        this.inFlight = true;
        this.decrypting = false;
        this.fetchedEntries = false;
        this.entries = [];
        this.encrypter = encrypterService.encrypter;
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.journalId = params.get('id');
            console.info(`Journal id is ${this.journalId}`);
            this.loadEntry()
        })
    }

    loadEntry() {
        this.inFlight = true;
        this.entriesService.getEntries(this.journalId)
            .subscribe(entries => {
                console.info('Starting decryption of entries');
                this.inFlight = false;
                this.decrypt(entries);
            });
    }

    decrypt(encryptedEntries: EntryEntity[]) {
        this.decrypting = true;

        // Create a copy of the encryptedEntries
        const decrypted: EntryEntity[] = encryptedEntries.slice(0);

        const decryptionPromises = [];
        encryptedEntries.map(entry => {
            decryptionPromises.push(this.encrypter.decrypt(entry.content));
        });

        // TODO: Decrypt entries individually and show progress for each entry
        Promise.all(decryptionPromises)
            .then((decryptedEntries: Base64Str[]) => {
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
