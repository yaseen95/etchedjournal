import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { JournalStore } from '../stores/journal.store';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    burgerIsActive: boolean = false;
    collapseDropdownOnMobile: boolean = true;

    public constructor(private authService: AuthService,
                       public store: JournalStore) {
    }

    ngOnInit(): void {
    }

    toggleBurgerMenu() {
        this.burgerIsActive = !this.burgerIsActive;
    }

    get user() {
        return this.authService.getUser();
    }

    toggleJournalDropdown() {
        this.collapseDropdownOnMobile = !this.collapseDropdownOnMobile;
    }
}
