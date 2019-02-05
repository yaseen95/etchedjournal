import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntryStore } from '../../stores/entry.store';

@Component({
    selector: 'app-entry-list-container',
    templateUrl: './entry-list-container.component.html',
    styleUrls: ['./entry-list-container.component.css']
})
export class EntryListContainerComponent implements OnInit {
    journalId: string;

    constructor(public entryStore: EntryStore,
                private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.journalId = params.get('id');
            console.info(`Journal id is ${this.journalId}`);
            this.entryStore.loadEntries(this.journalId);
        });
    }
}
