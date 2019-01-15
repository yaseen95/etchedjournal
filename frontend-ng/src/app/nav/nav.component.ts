import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    burgerIsActive: boolean = false;

    public constructor(private authService: AuthService) {
    }

    ngOnInit(): void {

    }

    toggleBurgerMenu() {
        this.burgerIsActive = !this.burgerIsActive;
    }

    get user() {
        return this.authService.getUser();
    }
}
