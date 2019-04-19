import { Component, Input } from '@angular/core';
import { JournalEntity } from '../../../services/models/journal-entity';

@Component({
    selector: 'app-journal-list-item',
    templateUrl: './journal-list-item.component.html',
    styleUrls: ['./journal-list-item.component.css'],
})
export class JournalListItemComponent {
    @Input()
    public journal: JournalEntity;
    public date: string;

    public ngOnInit() {
        this.date = new Date(this.journal.timestamp).toLocaleDateString();
    }
}
