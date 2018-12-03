import { inject, TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EtchedApiService } from '../services/etched-api.service';
import { Router } from '@angular/router';
import { TestUtils } from '../utils/test-utils.spec';

describe('AuthGuard', () => {
    let etchedApiSpy: any;
    let routerSpy: any;

    beforeEach(() => {
        etchedApiSpy = jasmine.createSpyObj('EtchedApiService', ['getUser']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                {provide: EtchedApiService, useValue: etchedApiSpy},
                {provide: Router, useValue: routerSpy},
            ],
            imports: [
                HttpClientTestingModule,
            ],
        });
    });

    it('should not allow route activation when user not logged in',
        inject([AuthGuard], (guard: AuthGuard) => {
            etchedApiSpy.getUser.and.returnValue(null);
            expect(guard.canActivate(null, null)).toBeFalsy();
        }));

    it('should allow route activation when logged in',
        inject([AuthGuard], (guard: AuthGuard) => {
            etchedApiSpy.getUser.and.returnValue(TestUtils.TEST_USER);
            expect(guard.canActivate(null, null)).toBeTruthy();
        }));
});
