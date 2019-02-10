import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';
import { EntryEntity } from '../../../models/entry-entity';

@Component({
    selector: 'app-entry-list',
    templateUrl: './entry-list.component.html',
    styleUrls: ['./entry-list.component.css'],
})
export class EntryListComponent {
    @Input()
    public entries: EntryEntity[];

    @Input()
    public journalId: string;

    constructor(private router: Router) {}

    public createEntry() {
        const navExtras = { queryParams: { journalId: this.journalId } };
        this.router.navigate([`${EtchedRoutes.ENTRIES_CREATE_PATH}`], navExtras);
    }
}
