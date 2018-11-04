import { Component, OnInit } from '@angular/core';
import { AbstractEditorContainerComponent } from '../abstract-editor-container-component/abstract-editor-container.component';
import { EtchedApiService } from '../../../services/etched-api.service';
import { ActivatedRoute } from '@angular/router';
import { Base64Str, Uuid } from '../../../models/encrypted-entity';
import { EtchEntity } from '../../../models/etch-entity';
import { EntryEntity } from '../../../models/entry-entity';
import { EncrypterService } from '../../../services/encrypter.service';

export enum EntityState {
    FETCHING = 'FETCHING',
    NOT_FOUND = 'NOT_FOUND',
    DECRYPTING = 'DECRYPTING',
    DECRYPTED = 'DECRYPTED',
}

@Component({
    selector: 'app-existing-entry-editor-container-component',
    templateUrl: './existing-entry-editor-container.component.html',
    styleUrls: ['./existing-entry-editor-container.component.css']
})
export class ExistingEntryEditorContainerComponent
    extends AbstractEditorContainerComponent
    implements OnInit {

    entryId: Uuid | null;

    entryState: EntityState;

    etchesState: EntityState;

    decryptedEtches: string[];

    constructor(
        etchedApi: EtchedApiService,
        encrypterService: EncrypterService,
        private route: ActivatedRoute
    ) {
        super(etchedApi, encrypterService);
        this.entryState = EntityState.FETCHING;
        this.etchesState = EntityState.FETCHING;

        this.entryId = route.snapshot.paramMap.get('id');
        console.info(`Entry id is ${this.entryId}`);
    }

    ngOnInit() {
        super.ngOnInit();
        this.etchedApi.getEntry(this.entryId)
            .subscribe(entry => {
                this.entry = entry;
                this.title = entry.content;
                this.decryptEntry(entry);
            });

        this.etchedApi.getEtches(this.entryId)
            .subscribe(etches => {
                this.decryptEtches(etches);
            });
    }

    decryptEntry(entry: EntryEntity) {
        console.info('Decrypting entry');
        this.entryState = EntityState.DECRYPTING;

        this.encrypter.decrypt(entry.content)
            .then(plaintext => {
                const copy = Object.assign({}, entry);
                copy.content = plaintext;
                this.entry = copy;
                this.title = plaintext;
                this.entryState = EntityState.DECRYPTED;
            });
    }

    decryptEtches(encEtches: EtchEntity[]) {
        console.info('Decrypting etches');
        this.etchesState = EntityState.DECRYPTING;

        // Create a copy of the encEtches
        const decrypted: EntryEntity[] = encEtches.slice(0);

        const decryptionPromises = [];
        encEtches.map(entry => {
            decryptionPromises.push(this.encrypter.decrypt(entry.content));
        });

        // TODO: Decrypt etches individually and show progress for each entry
        Promise.all(decryptionPromises)
            .then((decryptedEntries: Base64Str[]) => {
                console.info(`Decrypted ${decryptedEntries.length} entries`);
                decryptedEntries.forEach((decResult, index) => {
                    // Update the entry with the decrypted result
                    decrypted[index].content = decResult;
                });
                // TODO: Fix once responses are paginated
                // We're just replacing current etches
                this.decryptedEtches = decrypted.map(e => e.content);
                this.etchesState = EntityState.DECRYPTED;
            });
    }
}
