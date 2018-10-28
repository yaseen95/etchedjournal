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
    templateUrl: './entry-editor.component.html',
    styleUrls: ['./entry-editor.component.css'],
})
export class EntryEditorComponent implements OnInit, OnDestroy {

    /** list of etches */
    etches: string[];

    /** timestamp of last edit (millis since epoch) */
    recentEdit: number;

    /** etches not yet posted */
    queuedEtches: string[];

    /** the timer/interval used to post queued etches */
    queuedEtchInterval: number;

    /** the timer/interval used to etch entries due to inactivity */
    etchingInterval: number;

    /** the current state of the entry */
    entryCreationState: string;

    /** the current entry */
    entry?: EntryEntity;

    encrypter: Encrypter;

    /** The content of the etch that is currently being edited */
    currentEtchContent: string;

    /** Current title */
    title: string;

    /** Stores the previous title */
    // Used to check if the title content actually changes between edits
    prevTitle: string;

    @ViewChild('editor')
    editorElem: ElementRef;

    constructor(protected etchedApi: EtchedApiService) {
    }

    ngOnInit() {
        this.etches = [];
        this.entry = undefined;
        this.queuedEtches = [];

        this.recentEdit = Date.now();
        this.entryCreationState = ENTRY_NOT_CREATED;
        this.currentEtchContent = '';
        this.prevTitle = '';

        // TODO: Provide the encrypter via injection
        Encrypter.from(TEST_KEY_PAIR, 'passphrase')
            .then(encrypter => this.encrypter = encrypter);

        this.etchingInterval = window.setInterval(() => {
            // If user hasn't made any changes in `ETCH_TIMEOUT` seconds, we update
            if (this.entryCreationState == ENTRY_CREATED &&
                (Date.now() - this.recentEdit) >= ETCH_TIMEOUT) {
                this.etch();
            }
        }, 1000);

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
        window.clearInterval(this.etchingInterval);
        window.clearInterval(this.queuedEtchInterval);
    }

    onTitleChange(title: string) {
        if (title !== this.prevTitle) {
            this.title = title;
            this.prevTitle = title;
            // TODO: Update the title on the backend once editing is allowed
        }
    }

    /**
     * Responds to key events
     *
     * This checks if "enter" was pressed and will finalize the etch if it was.
     *
     * This is called before the input event handler `onEtchInput`. This allows us to finalize the
     * etch when enter is pressed.
     *
     * @param event
     */
    onEtchKeydown(event: KeyboardEvent) {
        // Update the recent edit date of the etch
        this.recentEdit = Date.now();

        // We don't want to update the etch if the user pressed "shift + enter"
        if (event.key === ENTER_KEY && !event.shiftKey) {
            // Finalize the etch
            // preventing default event to prevent a new line
            // preventing the default event will also stop the event from propagating to onEtchInput
            event.preventDefault();
            this.etch();
        }
    }

    /**
     * Responds to input changes on the etch
     *
     * This is invoked after `onEtchKeydown` and simply updates the current value with the new
     * value
     *
     * @param event
     */
    onEtchInput(event) {
        // Keydown is called first
        this.currentEtchContent = event.target.innerText;
    }

    /**
     * Etch the current etch
     *
     * This actually finalizes the current etch and it can't be edited beyond this point
     */
    etch() {
        const text = this.currentEtchContent.trim();
        if (text === '') {
            return;
        }

        // TODO: Add metadata representation of etch
        console.info(`Etching ${text}`);
        // Push the current etch to the list of etches being displayed
        this.etches.push(text);

        // TODO: Allow users to edit entry titles
        // Create an entry only when the user has writes their first etch
        if (this.entryCreationState === ENTRY_NOT_CREATED) {
            this.createEntry();
        }

        // Reset the etch
        this.editorElem.nativeElement.innerText = '';
        this.currentEtchContent = '';

        // this.etchEditorElement.nativeElement.textContent = '';
        // Add the etch to the queue so it can be encrypted and posted to the server
        this.queuedEtches.push(text);
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
            console.info('Entry is not yet created, waiting til it is created');
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
