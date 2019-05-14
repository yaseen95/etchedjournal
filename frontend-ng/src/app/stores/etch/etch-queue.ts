import { Injectable } from '@angular/core';
import { interval, Subject, Subscription } from 'rxjs';
import { AbstractEtch } from '../../models/etch/abstract-etch';
import { MultiMap } from '../../utils/multi-map';

@Injectable({ providedIn: 'root' })
export class EtchQueue {
    public readonly queueObs: Subject<MultiMap<string, AbstractEtch>>;
    /** contains queued etches, maps entry id to a list of etches */
    protected queued: MultiMap<string, AbstractEtch>;
    public subscription: Subscription;

    constructor() {
        this.queueObs = new Subject();
        this.queued = new MultiMap();
        this.subscription = interval(5000).subscribe(() => {
            this.broadcastQueued();
        });
    }

    public put(entryId: string, etches: AbstractEtch[]) {
        this.queued.setMany(entryId, etches);
    }

    public flush() {
        this.broadcastQueued();
    }

    public size() {
        return this.queued.size;
    }

    private broadcastQueued() {
        if (this.queued.size === 0) {
            return;
        }
        const copy = this.queued;
        this.queued = new MultiMap();
        this.queueObs.next(copy);
    }
}
