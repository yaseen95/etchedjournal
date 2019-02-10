import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
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
}
