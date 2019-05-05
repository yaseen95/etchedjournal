import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntryV1 } from '../../../models/entry/entry-v1';
import { EtchV1 } from '../../../models/etch/etch';
import { EtchQueueService } from '../../../services/etch-queue.service';
import { Schema } from '../../../services/models/schema';
import { EntryStore } from '../../../stores/entry.store';
import { EtchStore } from '../../../stores/etch.store';

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    selector: 'app-existing-entry-editor-container-component',
    templateUrl: './existing-entry-editor-container.component.html',
    styleUrls: ['./existing-entry-editor-container.component.css'],
})
export class ExistingEntryEditorContainerComponent implements OnInit {
    public entryId: string;
    public etches: EtchV1[];
    public title: string;

    constructor(
        public entryStore: EntryStore,
        public etchStore: EtchStore,
        private route: ActivatedRoute,
        private etchQueueService: EtchQueueService
    ) {
        this.entryId = route.snapshot.paramMap.get('id');
        console.info(`Entry id is ${this.entryId}`);
    }

    public ngOnInit() {
        this.entryStore.getEntry(this.entryId).then(() => {
            const entry = this.entryStore.entriesById.get(this.entryId);
            switch (entry.schema) {
                case Schema.V1_0:
                    this.title = (entry as EntryV1).content;
                    break;
                default:
                    throw new Error(`Unsupported version ${entry.schema}`);
            }
        });
        this.etchStore.loadEtches(this.entryId);
    }

    public onNewEtch(etch: EtchV1) {
        this.etchQueueService.put(this.entryId, etch);
    }

    public onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }

    public displaySpinner() {
        return this.entryStore.loading || this.etchStore.state.loading;
    }
}
