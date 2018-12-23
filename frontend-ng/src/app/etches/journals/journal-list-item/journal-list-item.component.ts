import { Component, Input, OnInit } from '@angular/core';
import { JournalEntity } from '../../../models/journal-entity';

@Component({
    selector: 'app-journal-list-item',
    templateUrl: './journal-list-item.component.html',
    styleUrls: ['./journal-list-item.component.css']
})
export class JournalListItemComponent implements OnInit {

    @Input()
    journal: JournalEntity;

    constructor() {
    }

    ngOnInit() {
    }
}
