import { inject, TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EtchedApiService } from '../services/etched-api.service';
import { Router } from '@angular/router';
import { TestUtils } from '../utils/test-utils.spec';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
    let authSpy: any;
    let routerSpy: any;

    beforeEach(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getUser']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                {provide: AuthService, useValue: authSpy},
                {provide: Router, useValue: routerSpy},
            ],
            imports: [
                HttpClientTestingModule,
            ],
        });
    });

    it('should not allow route activation when user not logged in',
        inject([AuthGuard], (guard: AuthGuard) => {
            authSpy.getUser.and.returnValue(null);
            expect(guard.canActivate(null, null)).toBeFalsy();
        }));

    it('should allow route activation when logged in',
        inject([AuthGuard], (guard: AuthGuard) => {
            authSpy.getUser.and.returnValue(TestUtils.TEST_USER);
            expect(guard.canActivate(null, null)).toBeTruthy();
        }));
});
