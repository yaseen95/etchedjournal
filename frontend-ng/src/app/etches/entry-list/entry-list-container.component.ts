import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntryStore } from '../../stores/entry.store';

@Component({
    selector: 'app-entry-list-container',
    templateUrl: './entry-list-container.component.html',
    styleUrls: ['./entry-list-container.component.css'],
})
export class EntryListContainerComponent implements OnInit {
    public journalId: string;

    constructor(public entryStore: EntryStore, private route: ActivatedRoute) {}

    public ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.journalId = params.get('id');
            this.entryStore.getEntries(this.journalId);
        });
    }
}
