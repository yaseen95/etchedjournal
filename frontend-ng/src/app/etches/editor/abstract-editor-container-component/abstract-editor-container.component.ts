import { Base64Str, EncryptedEntity } from '../../../models/encrypted-entity';
import { interval, Observable, Subscription } from 'rxjs';
import { EntryEntity } from '../../../models/entry-entity';
import { Encrypter, TEST_KEY_PAIR } from '../../../services/encrypter';
import { EtchedApiService } from '../../../services/etched-api.service';
import { OnDestroy, OnInit } from '@angular/core';

/**
 * Abstract base class used for Editor container components
 *
 * HAHAHAHAHAHAHAHAHAHA
 *
 * Look at this class name! I am definitely a java developer.
 *
 * Abstract class that can be used to share common functionality amongst editor containers.
 * Subclasses can access the fields directly. This class has implemented
 *   - {@link OnInit#ngOnInit} initializes an interval observable which will post queued etches
 *   - {@link OnDestroy#ngOnDestroy} will clean up the interval observable and post any
 *     remaining queued etches
 */
export abstract class AbstractEditorContainerComponent implements OnInit, OnDestroy {

    /** etches not yet posted */
    queuedEtches: string[];

    /** subscriber to an interval observer used to post queued etches */
    queueIntervalSubscription: Subscription;

    /** the current entry being edited */
    entry?: EntryEntity;

    /** the encryper used to encrypt entries/etches */
    encrypter: Encrypter;

    /** Current title */
    title: string;

    protected constructor(protected etchedApi: EtchedApiService) {
        this.queuedEtches = [];
    }

    ngOnInit() {
        this.queueIntervalSubscription = interval(5_000)
            .subscribe(() => this.postEtches());

        // TODO: Provide the encrypter via injection
        Encrypter.from(TEST_KEY_PAIR, 'passphrase')
            .then(encrypter => this.encrypter = encrypter);
    }

    ngOnDestroy() {
        console.log('Unmounting. Posting all queued etches');
        if (this.entry !== undefined) {
            // Can't be queued etches if the entry hasn't yet been created
            this.postEtches();
        }

        this.queueIntervalSubscription.unsubscribe();
    }

    /**
     * Invoked by subclasses when the title is changed
     *
     * Will update the entry once that functionality has been updated
     *
     * @param title updated title
     */
    onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }

    updateEntry() {
        // TODO: Allow updating of entry e.g. title change
    }

    /**
     * Posts the queued etches to the backend.
     *
     * NOTE: Will only post if the {@link entry} has been defined and there are queued etches.
     */
    postEtches() {
        // slice(0) creates a copy of the array
        let etches = this.queuedEtches.slice(0);

        if (etches.length === 0) {
            console.info('No queued etches');
            return;
        }

        if (this.entry === undefined || this.entry === null) {
            // We create the entry and will post the etches once the entry has been created
            console.info('Entry is not yet created');
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
