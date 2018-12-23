import { Component, Input, OnInit } from '@angular/core';
import { JournalEntity } from '../../../models/journal-entity';

@Component({
    selector: 'app-journal-list',
    templateUrl: './journal-list.component.html',
    styleUrls: ['./journal-list.component.css']
})
export class JournalListComponent implements OnInit {

    @Input()
    journals: JournalEntity[];

    constructor() {
    }

    ngOnInit() {
    }
}
