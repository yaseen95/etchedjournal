import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { JournalStore } from '../../../stores/journal.store';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-journals-container',
    templateUrl: './journals-container.component.html',
    styleUrls: ['./journals-container.component.css']
})
export class JournalsContainerComponent implements OnInit {
    constructor(public store: JournalStore) {
    }

    ngOnInit() {
        this.store.loadJournals();
    }

    displaySpinner(): boolean {
        // display spinner if journals have not been loaded at least once
        return !this.store.loadedOnce;
    }
}
