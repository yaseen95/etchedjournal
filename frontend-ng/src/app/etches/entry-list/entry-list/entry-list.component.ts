import { Component, Input, OnInit } from '@angular/core';
import { EntryEntity } from '../../../models/entry-entity';

@Component({
    selector: 'app-entry-list',
    templateUrl: './entry-list.component.html',
    styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

    @Input()
    entries: EntryEntity[];

    constructor() {
    }

    ngOnInit() {
    }
}
