import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { EntryEntity } from '../../models/entry-entity';
import { EtchedApiService } from '../../services/etched-api.service';
import { Encrypter, TEST_KEY_PAIR } from '../../services/encrypter';
import { Base64Str, EncryptedEntity } from '../../models/encrypted-entity';
import { Observable } from 'rxjs';

const ETCH_TIMEOUT = 5 * 1000;

const ENTER_KEY = 'Enter';
const ESC_KEY = 'Escape';

const ENTRY_NOT_CREATED = 'NOT_CREATED';
const ENTRY_CREATING = 'ENTRY_CREATING';
const ENTRY_CREATED = 'ENTRY_CREATED';

// TODO: This feels like it's doing way too much and can be broken down some more

@Component({
    selector: 'app-entry-editor',
    templateUrl: './editor-container.component.html',
    styleUrls: ['./editor-container.component.css'],
})
export class EditorContainerComponent implements OnInit, OnDestroy {

    /** etches not yet posted */
    queuedEtches: string[];

    /** the timer/interval used to post queued etches */
    queuedEtchInterval: number;

    /** the current state of the entry */
    entryCreationState: string;

    /** the current entry */
    entry?: EntryEntity;

    encrypter: Encrypter;

    /** Current title */
    title: string;

    /** Stores the previous title */
    // Used to check if the title content actually changes between edits
    prevTitle: string;

    constructor(protected etchedApi: EtchedApiService) {
    }

    ngOnInit() {
        this.entry = undefined;
        this.queuedEtches = [];

        this.entryCreationState = ENTRY_NOT_CREATED;
        this.prevTitle = '';

        // TODO: Provide the encrypter via injection
        Encrypter.from(TEST_KEY_PAIR, 'passphrase')
            .then(encrypter => this.encrypter = encrypter);

        this.queuedEtchInterval = window.setInterval(() => {
            this.postEtches();
        }, 5000);
    }

    ngOnDestroy(): void {
        console.log('Unmounting. Posting all queued etches');
        if (this.entry !== undefined) {
            // Can't be queued etches if the entry hasn't yet been created
            this.postEtches();
        }

        // clear intervals
        window.clearInterval(this.queuedEtchInterval);
    }

    onTitleChange(title: string) {
        if (title !== this.prevTitle) {
            this.title = title;
            this.prevTitle = title;
            // TODO: Update the title on the backend once editing is allowed
        }
    }

    onNextEtch(e: string) {
        this.queuedEtches.push(e);
    }

    /**
     * Creates an entry
     */
    createEntry() {
        console.info('attempting to create netry');
        if (this.entryCreationState !== ENTRY_NOT_CREATED) {
            // The entry has already been created, don't need to do anything here
            console.info('entry has already been created or is creating');
            return;
        }

        console.log(`Creating entry`);
        this.entryCreationState = ENTRY_CREATING;

        this.encrypter.encrypt(this.title)
            .then(ciphertext => {
                this.etchedApi.createEntry(ciphertext)
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
        // slice(0) creates a copy of the array
        let etches = this.queuedEtches.slice(0);

        if (etches.length === 0) {
            console.info('No queued etches');
            return;
        }

        if (this.entry === undefined || this.entry === null) {
            console.info('Entry is not yet created');
            // We create the entry and will post the etches once the entry has been created
            this.createEntry();
            return;
        }

        // TODO: Improve performance
        // It's blocking the main thread on my 2017 Macbook Pro. That's way too slow!

        // Encrypt all the etches
        console.info('Starting encryption of etches');
        let encrypting = etches.map((etch: string) => this.encrypter.encrypt(etch));

        // Wait for all them to encrypt and then post them in a single request
        Promise.all(encrypting)
            .then((encryptedEtches: Base64Str[]) => {
                // TODO: Handle queue getting really large e.g. 100 elements
                // Break it up against multiple requests???
                console.info('Encryption finished');
                console.info(`Posting ${encryptedEtches.length} etches`);
                return this.etchedApi.postEtches(this.entry.id, encryptedEtches);
            })
            .then((savedEtchesObs: Observable<EncryptedEntity[]>) => {
                savedEtchesObs.subscribe(savedEtches => {
                    // Remove the posted etches from the queue
                    this.queuedEtches = this.queuedEtches.slice(savedEtches.length);
                    console.info(`Successfully posted ${savedEtches.length} etches`);
                });
            });
    }
}
