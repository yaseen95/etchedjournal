import { Component, Input } from '@angular/core';
import { AbstractJournal } from '../../../models/journal/abstract-journal';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { JournalEntity } from '../../../services/models/journal-entity';

@Component({
    selector: 'app-journal-list-item',
    templateUrl: './journal-list-item.component.html',
    styleUrls: ['./journal-list-item.component.css'],
})
export class JournalListItemComponent {
    @Input()
    public entity: JournalEntity;
    @Input()
    public journal: JournalV1;
    public date: string;

    public ngOnInit() {
        this.date = new Date(this.journal.created).toLocaleDateString();
    }
}
