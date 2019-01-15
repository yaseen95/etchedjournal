import { Component, OnInit } from '@angular/core';
import { combineLatest, from, interval } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { EtchedRoutes } from '../../app-routing-utils';

/**
 * Very basic component that displays a logout spinner (with a fake delay)
 */
@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

    constructor(private router: Router,
                private authService: AuthService) {
    }

    ngOnInit() {
        const authObs = from(this.authService.logout());

        // Use random jitter to make it look like something's happening
        const jitter = Math.floor(Math.random() * 1000);
        const intervalObs = interval(500 + jitter).pipe(take(1));

        combineLatest(authObs, intervalObs)
            .subscribe(() => this.router.navigate(['']));
    }
}
