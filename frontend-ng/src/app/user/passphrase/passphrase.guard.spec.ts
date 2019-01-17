import { inject, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { Encrypter } from '../../services/encrypter';
import { EncrypterService } from '../../services/encrypter.service';
import { PassphraseGuard } from './passphrase.guard';

describe('PassphraseGuard', () => {
    let routerSpy: any;
    let encrypterService: EncrypterService;

    beforeEach(() => {
        encrypterService = new EncrypterService();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                PassphraseGuard,
                {provide: EncrypterService, useValue: encrypterService},
                {provide: Router, useValue: routerSpy},
            ],
            imports: [
                HttpClientTestingModule,
            ],
        });
    });

    it('should allow route activation when encrypter exists',
        inject([PassphraseGuard], (guard: PassphraseGuard) => {
            encrypterService.encrypter = {} as Encrypter;
            expect(guard.canActivate(null, null)).toBeTruthy();
        })
    );

    it('redirecting to enter-passphrase passes the current route',
        inject([PassphraseGuard], (guard: PassphraseGuard) => {
            const state = {url: 'current-route'} as RouterStateSnapshot;
            guard.canActivate(null, state);

            const navExtras = {queryParams: {next: 'current-route'}};
            expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['enter-passphrase'], navExtras);
        })
    );

    it('guard redirects to enter-passphrase when encrypter does not exist',
        inject([PassphraseGuard], (guard: AuthGuard) => {
            const state = {url: 'route'} as RouterStateSnapshot;
            expect(guard.canActivate(null, state)).toBeFalsy();
        }));
});
