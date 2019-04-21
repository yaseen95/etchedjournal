import { Component } from '@angular/core';
import { AbstractJournal } from '../models/journal/abstract-journal';
import { JournalV1 } from '../models/journal/journal-v1';
import { AuthService } from '../services/auth.service';
import { Schema } from '../services/models/schema';
import { JournalStore } from '../stores/journal.store';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
})
export class NavComponent {
    public burgerIsActive: boolean = false;
    public collapseDropdownOnMobile: boolean = true;

    public constructor(private authService: AuthService, public store: JournalStore) {}

    public toggleBurgerMenu() {
        this.burgerIsActive = !this.burgerIsActive;
    }

    get user() {
        return this.authService.getUser();
    }

    public toggleJournalDropdown() {
        this.collapseDropdownOnMobile = !this.collapseDropdownOnMobile;
    }

    public getJournalName(id: string): string {
        const journal: AbstractJournal = this.store.journalsById.get(id);
        switch (journal.schema) {
            case Schema.V1_0:
                return (journal as JournalV1).name;
            default:
                throw new Error(`Unexpected schema ${journal.schema}`);
        }
    }
}
