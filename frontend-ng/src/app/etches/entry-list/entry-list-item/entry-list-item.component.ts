import { Component, Input, OnInit } from '@angular/core';
import { EntryEntity } from '../../../models/entry-entity';

@Component({
    selector: 'app-entry-list-item',
    templateUrl: './entry-list-item.component.html',
    styleUrls: ['./entry-list-item.component.css'],
})
export class EntryListItemComponent implements OnInit {
    @Input()
    public entry: EntryEntity;
    public timestampStr: string;

    public ngOnInit() {
        this.timestampStr = new Date(this.entry.timestamp).toString();
    }
}
