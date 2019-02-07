import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EtchV1 } from '../../../models/etch';
import { EtchEntity } from '../../../models/etch-entity';
import { Encrypter } from '../../../services/encrypter';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchQueueService } from '../../../services/etch-queue.service';
import { EtchesService } from '../../../services/etches.service';
import { EntryStore } from '../../../stores/entry.store';

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
export class ExistingEntryEditorContainerComponent implements OnInit {

    entryId: string | null;

    etchesState: EntityState;

    etches: EtchV1[];

    title?: string;

    encrypter: Encrypter;

    constructor(
        private etchesService: EtchesService,
        public entryStore: EntryStore,
        private route: ActivatedRoute,
        private etchQueueService: EtchQueueService,
        encrypterService: EncrypterService
    ) {
        this.encrypter = encrypterService.encrypter;
        this.entryId = route.snapshot.paramMap.get('id');
        console.info(`Entry id is ${this.entryId}`);
    }

    ngOnInit() {
        this.etchesState = EntityState.FETCHING;
        this.entryStore.loadEntry(this.entryId)
            .then(entry => {
                this.title = entry.content;
            });

        // TODO: paginate requests
        this.etchesService.getEtches(this.entryId)
            .subscribe(e => {
                this.decryptEtches(e);
            });
    }

    decryptEtches(encEtches: EtchEntity[]) {
        console.info('Decrypting etches');
        this.etchesState = EntityState.DECRYPTING;

        const decrypted: EtchV1[] = [];

        const decryptionPromises = [];
        encEtches.map(entry => {
            decryptionPromises.push(this.encrypter.decrypt(entry.content));
        });

        // TODO: Decrypt etches individually and show progress for each entry
        Promise.all(decryptionPromises)
            .then((decryptedEtches: string[]) => {
                decryptedEtches.forEach(e => {
                    const etches: EtchV1[] = JSON.parse(e);
                    decrypted.push(...etches);
                });
                this.etchesState = EntityState.DECRYPTED;
                this.etches = decrypted;
            });
    }

    onNewEtch(etch: EtchV1) {
        this.etchQueueService.put(this.entryId, etch);
    }

    onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }

    displaySpinner() {
        return this.entryStore.loading || this.etchesState !== EntityState.DECRYPTED;
    }
}
