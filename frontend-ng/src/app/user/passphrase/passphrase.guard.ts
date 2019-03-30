import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EtchedRoutes } from '../../app-routing-utils';
import { EncrypterService } from '../../services/encrypter.service';

@Injectable({
    providedIn: 'root',
})
export class PassphraseGuard implements CanActivate {
    constructor(private encrypterService: EncrypterService, private router: Router) {
    }

    public canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // User has to enter the passphrase if the encrypter is not defined

        return this.encrypterService.loadEncrypter()
            .then((e) => {
                if (e === null) {
                    const navExtras = { queryParams: { next: state.url } };
                    this.router.navigate([EtchedRoutes.ENTER_PASSPHRASE_PATH], navExtras);
                    return false;
                }
                return true;
            });
    }
}
