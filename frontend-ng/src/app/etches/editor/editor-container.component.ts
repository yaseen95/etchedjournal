import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntryV1 } from '../../models/entry/entry-v1';
import { AbstractEtch } from '../../models/etch/abstract-etch';
import { EtchV1 } from '../../models/etch/etch-v1';
import { ClockService } from '../../services/clock.service';
import { EntryEntity } from '../../services/models/entry-entity';
import { EntryStore } from '../../stores/entry.store';
import { EtchStore } from '../../stores/etch/etch.store';
import { maybeUpdateTitle } from './editor-container-utils';

export enum EntryState {
    NOT_CREATED,
    CREATING,
    CREATED,
}

@Component({
    selector: 'app-editor-container',
    templateUrl: './editor-container.component.html',
    styleUrls: ['./editor-container.component.css'],
})
export class EditorContainerComponent {
    /** Current title */
    public title: string;
    private readonly journalId: string;
    public entry: EntryEntity | null;
    // Have to keep our own queue until the entry is created
    private queuedEtches: AbstractEtch[] = [];
    /** the current state of the entry */
    public state: EntryState;

    constructor(
        private entryStore: EntryStore,
        private etchStore: EtchStore,
        private clockService: ClockService,
        private location: Location,
        route: ActivatedRoute
    ) {
        this.title = clockService.now().toLocaleDateString();
        this.entry = null;
        // TODO: Should we subscribe to journalId param changes or is snapshot okay?
        this.journalId = route.snapshot.queryParamMap.get('journalId');
        if (this.journalId === null) {
            // TODO: 404 or something
            console.error('No journal id');
        }
        this.state = EntryState.NOT_CREATED;
    }

    public onNewEtch(etch: EtchV1) {
        if (this.entry === null) {
            this.queuedEtches.push(etch);
            this.createEntry();
        } else {
            this.queueEtches([etch]);
        }
    }

    /**
     * Creates an entry
     */
    private async createEntry() {
        console.info('Attempting to create entry');
        if (this.state !== EntryState.NOT_CREATED) {
            // The entry has already been created, don't need to do anything here
            console.info('entry has already been created or is creating');
            return;
        }
        this.state = EntryState.CREATING;
        console.info('Creating entry');
        const entryV1: EntryV1 = new EntryV1({
            content: this.title,
            created: this.clockService.nowMillis(),
        });
        this.entry = await this.entryStore.createEntry(this.journalId, entryV1);

        // Have to replace state instead of adding.
        // This editor is called by visiting `/entries/new`
        // When the Etch is created we want to replace the URL instead of pushing a new one to
        // the state. If the user navigates back they should go back to the entry list. If we
        // added a state it may seem confusing if they navigate backwards. Consider,
        //  1. User opens entry list
        //  2. Creates a new entry by opening /entries/new, default title is 12/05/2019
        //  3. User creates a few etches
        //  4. Entry is created and we add URL `/entries/A4nJpaSAAb0` to the state
        //  5. User navigates backwards and it creates a new entry with title 12/05/2019.
        // It may seem like their etches were lost by navigating backwards.
        this.location.replaceState(`/entries/${this.entry.id}`);

        console.log(`Created entry with id ${this.entry.id}`);
        this.state = EntryState.CREATED;

        console.info('posting queued etches');
        const copy = this.queuedEtches.slice();
        this.queuedEtches = [];
        this.queueEtches(copy);
    }

    private queueEtches(etches: AbstractEtch[]) {
        this.etchStore.addEtches(this.entry.id, etches);
    }

    public onTitleChange(title: string) {
        this.title = title;
        // Only rename if the updated text is different
        if (this.state !== EntryState.CREATED) {
            console.info('Skipping title update because entry is not created');
            return;
        }
        maybeUpdateTitle(this.entryStore, this.entry.id, title);
    }
}
