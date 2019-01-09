import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EtchedRoutes } from '../app-routing-utils';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService,
                private router: Router) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // User can access authenticated routes if they're logged in
        if (this.authService.getUser() !== null) {
            return true;
        }

        this.router.navigate([EtchedRoutes.LOGIN_PATH]);
        return false;
    }
}
