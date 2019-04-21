import { Component, Input } from '@angular/core';
import { AbstractJournal } from '../../../models/journal/abstract-journal';
import { JournalEntity } from '../../../services/models/journal-entity';

@Component({
    selector: 'app-journal-list',
    templateUrl: './journal-list.component.html',
    styleUrls: ['./journal-list.component.css'],
})
export class JournalListComponent {
    @Input()
    public entities: JournalEntity[];

    @Input()
    public journalsById: Map<string, AbstractJournal>;
}
