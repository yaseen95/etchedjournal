import { Component, Input, OnInit } from '@angular/core';
import { EntryEntity } from '../../../models/entry-entity';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';

@Component({
    selector: 'app-entry-list',
    templateUrl: './entry-list.component.html',
    styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

    @Input()
    entries: EntryEntity[];

    @Input()
    journalId: string;

    constructor(private router: Router) {
    }

    ngOnInit() {
    }

    createEntry() {
        const navExtras = {queryParams: {journalId: this.journalId}};
        this.router.navigate([`${EtchedRoutes.ENTRIES_CREATE_PATH}`], navExtras);
    }
}
