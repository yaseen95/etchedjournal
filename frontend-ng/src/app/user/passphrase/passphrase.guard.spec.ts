import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { EncrypterService } from '../../services/encrypter.service';
import { PassphraseGuard } from './passphrase.guard';

describe('PassphraseGuard', () => {
    let routerSpy: any;
    let encrypterService: any;

    beforeEach(() => {
        class TestEncrypterService {
            public encrypter: any = null;
            public async loadEncrypter(): Promise<any> {
                return Promise.resolve(this.encrypter);
            }
        }
        encrypterService = new TestEncrypterService();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                PassphraseGuard,
                { provide: EncrypterService, useValue: encrypterService },
                { provide: Router, useValue: routerSpy },
            ],
            imports: [HttpClientTestingModule],
        });
    });

    it('should allow route activation when encrypter exists', inject(
        [PassphraseGuard],
        async (guard: PassphraseGuard) => {
            encrypterService.encrypter = {} as any;
            const result = await guard.canActivate(null, null);
            expect(result).toEqual(true);
        }
    ));

    it('redirecting to enter-passphrase passes the current route', inject(
        [PassphraseGuard],
        async (guard: PassphraseGuard) => {
            encrypterService.encrypter = null;
            const state = { url: 'current-route' } as any;
            await guard.canActivate(null, state);
            const navExtras = { queryParams: { next: 'current-route' } };
            expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['enter-passphrase'], navExtras);
        }
    ));

    it('guard redirects to enter-passphrase when encrypter does not exist', inject(
        [PassphraseGuard],
        async (guard: AuthGuard) => {
            const state = { url: 'route' } as any;
            const result = await guard.canActivate(null, state);
            expect(result).toBeFalsy();
        }
    ));
});
