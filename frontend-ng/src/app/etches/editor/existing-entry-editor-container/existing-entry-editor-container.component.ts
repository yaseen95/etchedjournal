import { Component, OnInit } from '@angular/core';
import { EtchedApiService } from '../../../services/etched-api.service';
import { ActivatedRoute } from '@angular/router';
import { EtchEntity } from '../../../models/etch-entity';
import { EntryEntity } from '../../../models/entry-entity';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchQueueService } from '../../../services/etch-queue.service';
import { Encrypter } from '../../../services/encrypter';
import { EtchV1 } from '../../../models/etch';

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

    entryState: EntityState;

    etchesState: EntityState;

    etches: EtchV1[];

    entry?: EntryEntity;

    title?: string;

    encrypter: Encrypter;

    constructor(
        private etchedApi: EtchedApiService,
        private route: ActivatedRoute,
        private etchQueueService: EtchQueueService,
        encrypterService: EncrypterService
    ) {
        if (encrypterService.encrypter === null) {
            throw new Error('encrypter is null');
        }
        this.encrypter = encrypterService.encrypter;
        this.entryId = route.snapshot.paramMap.get('id');
        console.info(`Entry id is ${this.entryId}`);
    }

    ngOnInit() {
        this.entryState = EntityState.FETCHING;
        this.etchesState = EntityState.FETCHING;

        this.etchedApi.getEntry(this.entryId)
            .subscribe(e => {
                this.decryptEntry(e);
            });

        // TODO: paginate requests
        this.etchedApi.getEtches(this.entryId)
            .subscribe(e => {
                this.decryptEtches(e);
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
        this.etchQueueService.put(this.entry.id, etch);
    }

    onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }
}
