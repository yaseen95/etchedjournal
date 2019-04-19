import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { AbstractEtch } from '../models/etch/etch';
import { EtchStore } from '../stores/etch.store';

/**
 * Queues etches and posts them as batches to the server
 */
@Injectable({
    providedIn: 'root',
})
export class EtchQueueService {
    /** contains queued etches, maps entry id to a list of etches */
    public queuedEtches: Map<string, AbstractEtch[]>;

    /** subscriber to an interval observer used to post queued etches */
    private queueIntervalSubscription: Subscription;

    constructor(private etchStore: EtchStore) {
        this.queuedEtches = new Map<string, any>();
        this.queueIntervalSubscription = interval(5_000).subscribe(() => {
            this.postQueuedEtches();
        });
    }

    /**
     * Puts an etch on the queue
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
    public postQueuedEtches() {
        if (this.queuedEtches.size === 0) {
            return;
        }

        const copy = this.queuedEtches;
        this.queuedEtches = new Map();

        for (const [entryId, etches] of Array.from(copy.entries())) {
            this.etchStore.createEtches(entryId, etches);
        }
    }
}
