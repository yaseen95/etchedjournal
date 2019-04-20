import { Component, Input, OnInit } from '@angular/core';
import { EntryV1 } from '../../../models/entry/entry-v1';
import { EntryEntity } from '../../../services/models/entry-entity';

@Component({
    selector: 'app-entry-list-item',
    templateUrl: './entry-list-item.component.html',
    styleUrls: ['./entry-list-item.component.css'],
})
export class EntryListItemComponent implements OnInit {
    @Input()
    public entry: EntryV1;

    @Input()
    public entity: EntryEntity;

    public timestampStr: string;

    public ngOnInit() {
        this.timestampStr = new Date(this.entry.timestamp).toString();
    }
}
