import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EtchV1 } from '../../../models/etch';
import { EtchQueueService } from '../../../services/etch-queue.service';
import { EntryStore } from '../../../stores/entry.store';
import { EtchStore } from '../../../stores/etch.store';

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    selector: 'app-existing-entry-editor-container-component',
    templateUrl: './existing-entry-editor-container.component.html',
    styleUrls: ['./existing-entry-editor-container.component.css']
})
export class ExistingEntryEditorContainerComponent implements OnInit {

    entryId: string;

    etches: EtchV1[];

    title: string;

    constructor(
        public entryStore: EntryStore,
        public etchStore: EtchStore,
        private route: ActivatedRoute,
        private etchQueueService: EtchQueueService
    ) {
        this.entryId = route.snapshot.paramMap.get('id');
        console.info(`Entry id is ${this.entryId}`);
    }

    ngOnInit() {
        this.entryStore.loadEntry(this.entryId)
            .then(entry => {
                this.title = entry.content;
            });

        this.etchStore.loadEtches(this.entryId)
            .then(() => {
            });
    }

    onNewEtch(etch: EtchV1) {
        this.etchQueueService.put(this.entryId, etch);
    }

    onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }

    displaySpinner() {
        return this.entryStore.loading || this.etchStore.state.loading;
    }
}
