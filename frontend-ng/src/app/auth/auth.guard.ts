import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EtchedApiService } from '../services/etched-api.service';
import { EtchedRoutes } from '../app-routing-utils';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private etchedApiService: EtchedApiService,
                private router: Router) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // User can access authenticated routes if they're logged in
        if (this.etchedApiService.getUser() !== null) {
            return true;
        }

        this.router.navigate([EtchedRoutes.LOGIN_PATH]);
        return false;
    }
}
