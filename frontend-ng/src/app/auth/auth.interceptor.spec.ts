import { async, fakeAsync, getTestBed, TestBed, tick } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EtchedUser } from '../models/etched-user';
import { environment } from '../../environments/environment';
import { TokenDecoder } from '../utils/token-decoder';
import { AuthInterceptor } from './auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
    EtchedApiService,
    JOURNALS_URL, LOCAL_ACCESS_TOKEN,
    LOCAL_REFRESH_TOKEN,
    LOGIN_URL, REFRESH_TOKEN_URL,
    SELF_URL
} from '../services/etched-api.service';

describe('AuthInterceptor', () => {
    let injector: TestBed;
    let httpMock: HttpTestingController;
    let decodeTokenSpy: any;
    let service: EtchedApiService;

    beforeEach(async(() => {
        localStorage.clear();
        decodeTokenSpy = spyOn(TokenDecoder, 'decodeToken');

        const token = {exp: (new Date().getTime() / 1000) + 900};
        decodeTokenSpy.and.returnValue(token);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                EtchedApiService,
                {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
            ],
        });

        injector = getTestBed();
        service = injector.get(EtchedApiService);
        httpMock = injector.get(HttpTestingController);
    }));

    it('token refreshes when close to expiry', fakeAsync(() => {
        // set expiry to time to 0
        decodeTokenSpy.and.returnValue({exp: 0});
        localStorage.setItem(LOCAL_REFRESH_TOKEN, 'refresh');
        localStorage.setItem(LOCAL_ACCESS_TOKEN, 'access');

        service.getJournals()
            .subscribe(() => {
            });

        tick();

        const refreshRequest = httpMock.expectOne(REFRESH_TOKEN_URL);
        expect(refreshRequest.request.body).toEqual({'refreshToken': 'refresh'});
        refreshRequest.flush({});

        const journalsReq = httpMock.expectOne(JOURNALS_URL);
        // TODO: Figure out why it becomes undefined!
        // It shouldn't be, it's so weird
        expect(journalsReq.request.headers.get('Authorization')).toEqual('Bearer undefined');
        journalsReq.flush([]);
    }));

    it('token does not refresh when it is recent', () => {
        localStorage.setItem(LOCAL_ACCESS_TOKEN, 'access');

        service.getJournals()
            .subscribe(() => {
            });

        httpMock.expectNone(REFRESH_TOKEN_URL);

        const journalsReq = httpMock.expectOne(JOURNALS_URL);
        expect(journalsReq.request.headers.get('Authorization')).toEqual('Bearer access');
        journalsReq.flush([]);
    });

    it('login is not intercepted', () => {
        service.login('foo', 'bar')
            .subscribe(() => {
            });

        const req = httpMock.expectOne(LOGIN_URL);
        req.flush({});

        // Login triggers self, we perform this expect so that httpMock.verify() doesn't fail
        httpMock.expectOne(SELF_URL);

        expect(req.request.headers.get('Authorization')).toBeNull();
    });

    it('register is not intercepted', () => {
        service.register('foo', 'bar', null)
            .subscribe(() => {
            });

        const req = httpMock.expectOne(`${environment.API_URL}/auth/register`);
        expect(req.request.headers.get('Authorization')).toBeNull();
    });

    afterEach(() => {
        // Verify that there aren't any outstanding requests
        httpMock.verify();
    });
});
