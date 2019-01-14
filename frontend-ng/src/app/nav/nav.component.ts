import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
    burgerIsActive: boolean = false;

    public constructor(private authService: AuthService,
                       private router: Router) {
    }

    ngOnInit(): void {

    }

    toggleBurgerMenu() {
        this.burgerIsActive = !this.burgerIsActive;
    }

    logout() {
        this.authService.logout()
            .then(() => this.router.navigate(["/"]));
    }

    get user() {
        return this.authService.getUser();
    }
}

