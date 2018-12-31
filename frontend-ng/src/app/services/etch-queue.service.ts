import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { EtchedApiService } from './etched-api.service';
import { EncrypterService } from './encrypter.service';
import { AbstractEtch } from '../models/etch';

/**
 * Queues etches and posts them as batches to the server
 */
@Injectable({
    providedIn: 'root'
})
export class EtchQueueService {

    /** contains queued etches, maps entry id to a list of etches */
    queuedEtches: Map<string, AbstractEtch[]>;

    /** subscriber to an interval observer used to post queued etches */
    private queueIntervalSubscription: Subscription;

    constructor(private etchedApi: EtchedApiService,
                private encrypterService: EncrypterService) {
        if (this.encrypterService.encrypter === null) {
            console.error('Encrypter is null');
        }
        this.queuedEtches = new Map<string, any>();
        this.queueIntervalSubscription = interval(5_000)
            .subscribe(() => {
                console.info('queue thing');
                this.postQueuedEtches();
            });
    }

    /**
     * Puts an etch on the queue
     * @param entryId
     * @param etch
     */
    public put(entryId: string, etch: AbstractEtch) {
        let etches = this.queuedEtches.get(entryId);
        if (etches === null || etches === undefined) {
            etches = [];
        }
        etches.push(etch);
        this.queuedEtches.set(entryId, etches);
    }

    // @VisibleForTesting
    postQueuedEtches() {
        if (this.queuedEtches.size === 0) {
            return;
        }

        const copy = this.queuedEtches;
        this.queuedEtches = new Map();

        for (let [entryId, etches] of Array.from(copy.entries())) {
            this.postEtches(entryId, etches);
        }
    }

    private postEtches(entryId: string, etches: AbstractEtch[]) {
        console.info('Posting etches');
        const enc = this.encrypterService.encrypter;

        const payload = JSON.stringify(etches);
        enc.encrypt(payload)
            .then(encrypted => {
                return this.etchedApi.postEtches(enc.keyPairId, entryId, [encrypted]);
            })
            .then(etchesObs => {
                etchesObs.subscribe(() => {
                    console.info(`Successfully posted ${etches.length} etches for entry ${entryId}`);
                });
            });
    }
}
