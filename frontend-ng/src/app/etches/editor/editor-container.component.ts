import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { EntryV1 } from '../../models/entry/entry-v1';
import { AbstractEtch, EtchV1 } from '../../models/etch/etch';
import { ClockService } from '../../services/clock.service';
import { EtchQueueService } from '../../services/etch-queue.service';
import { EntryEntity } from '../../services/models/entry-entity';
import { EntryStore } from '../../stores/entry.store';

const ENTRY_NOT_CREATED = 'NOT_CREATED';
const ENTRY_CREATING = 'ENTRY_CREATING';
const ENTRY_CREATED = 'ENTRY_CREATED';

@Component({
    selector: 'app-editor-container',
    templateUrl: './editor-container.component.html',
    styleUrls: ['./editor-container.component.css'],
})
export class EditorContainerComponent implements OnInit, OnDestroy {
    /** Current title */
    public title: string;

    /** the current state of the entry */
    private entryCreationState: string;

    private journalId: string;

    // Have to keep our own queue until the entry is created
    private queuedEtches: AbstractEtch[] = [];

    private entrySubject: BehaviorSubject<EntryEntity>;

    constructor(
        private entryStore: EntryStore,
        private etchQueueService: EtchQueueService,
        private clockService: ClockService,
        route: ActivatedRoute
    ) {
        this.title = clockService.now().toLocaleDateString();
        this.entrySubject = new BehaviorSubject(null);
        // TODO: Should we subscribe to journalId param changes or is snapshot okay?
        this.journalId = route.snapshot.queryParamMap.get('journalId');
        if (this.journalId === null) {
            console.error('No journal id');
        }
    }

    public ngOnInit() {
        this.entryCreationState = ENTRY_NOT_CREATED;

        this.entrySubject.subscribe(entry => {
            if (entry !== null) {
                console.info('posting queued etches');
                const copy = this.queuedEtches.slice();
                this.queuedEtches = [];
                copy.forEach(etch => {
                    this.queueEtch(etch);
                });
            }
        });
    }

    public ngOnDestroy() {
        this.entrySubject.unsubscribe();
    }

    /**
     * Creates an entry
     */
    private async createEntry() {
        console.info('Attempting to create entry');
        if (this.entryCreationState !== ENTRY_NOT_CREATED) {
            // The entry has already been created, don't need to do anything here
            console.info('entry has already been created or is creating');
            return;
        }
        this.entryCreationState = ENTRY_CREATING;
        console.info('Creating entry');
        const entryV1: EntryV1 = new EntryV1({
            content: this.title,
            created: this.clockService.nowMillis(),
        });
        const entry = await this.entryStore.createEntry(this.journalId, entryV1);
        console.log(`Created entry with id ${entry.id}`);
        this.entryCreationState = ENTRY_CREATED;
        this.entrySubject.next(entry);
    }

    public onNewEtch(etch: EtchV1) {
        this.queuedEtches.push(etch);

        const entry = this.entrySubject.getValue();
        if (entry === null) {
            this.createEntry();
        } else {
            this.queueEtch(etch);
        }
    }

    private queueEtch(etch: AbstractEtch) {
        const entry = this.entrySubject.getValue();
        this.etchQueueService.put(entry.id, etch);
    }

    public onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }
}
