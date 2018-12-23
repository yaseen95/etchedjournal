import { Component } from '@angular/core';
import { EtchedApiService } from '../../services/etched-api.service';
import { AbstractEditorContainerComponent } from './abstract-editor-container-component/abstract-editor-container.component';
import { EncrypterService } from '../../services/encrypter.service';
import { ActivatedRoute } from '@angular/router';

const ENTRY_NOT_CREATED = 'NOT_CREATED';
const ENTRY_CREATING = 'ENTRY_CREATING';
const ENTRY_CREATED = 'ENTRY_CREATED';

@Component({
    selector: 'app-editor-container',
    templateUrl: './editor-container.component.html',
    styleUrls: ['./editor-container.component.css'],
})
export class EditorContainerComponent
    extends AbstractEditorContainerComponent {

    /** the current state of the entry */
    entryCreationState: string;

    journalId: string;

    constructor(etchedApi: EtchedApiService,
                encrypterService: EncrypterService,
                route: ActivatedRoute) {
        super(etchedApi, encrypterService);
        this.journalId = route.snapshot.queryParamMap.get('journalId');
        if (this.journalId === null) {
            console.error('No journal id');
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.entry = undefined;
        this.entryCreationState = ENTRY_NOT_CREATED;
    }

    /**
     * Creates an entry
     */
    createEntry() {
        console.info('attempting to create entry');
        if (this.entryCreationState !== ENTRY_NOT_CREATED) {
            // The entry has already been created, don't need to do anything here
            console.info('entry has already been created or is creating');
            return;
        }

        console.log(`Creating entry`);
        this.entryCreationState = ENTRY_CREATING;

        this.encrypter.encrypt(this.title)
            .then(ciphertext => {
                console.info(`creating entry with title: ${this.title}`);
                this.etchedApi.createEntry(this.journalId, ciphertext)
                    .subscribe(entry => {
                        console.log(`Created entry with id ${entry.id}`);
                        this.entryCreationState = ENTRY_CREATED;
                        this.entry = entry;
                    });
            });
    }

    /**
     * Post the queued etches to the backend
     */
    postEtches() {
        if (this.queuedEtches.length === 0) {
            return;
        }

        if (this.entry === undefined || this.entry === null) {
            this.createEntry();
        }
        super.postEtches();
    }
}
