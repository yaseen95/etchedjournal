import { Component, Input, OnInit } from '@angular/core';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { JournalEntity } from '../../../services/models/journal-entity';
import { JournalStore } from '../../../stores/journal.store';

@Component({
    selector: 'app-journal-list-item',
    templateUrl: './journal-list-item.component.html',
    styleUrls: ['./journal-list-item.component.css'],
})
export class JournalListItemComponent implements OnInit {
    @Input()
    public entity: JournalEntity;
    @Input()
    public journal: JournalV1;
    public date: string;

    public constructor(private journalStore: JournalStore) {}

    public ngOnInit() {
        this.date = new Date(this.journal.created).toLocaleDateString();
    }

    public renameJournal(name: string) {
        // Only rename if the updated text is different
        if (name.trim() !== this.journal.name.trim()) {
            console.info('Renaming journal');
            const newJournal: JournalV1 = { ...this.journal, name };
            this.journalStore.updateJournal(this.entity.id, newJournal);
        }
    }
}
