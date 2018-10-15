import { getTestBed, TestBed } from '@angular/core/testing';

import { EtchedApiService } from './etched-api.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '../../../node_modules/@angular/common/http/testing';
import { EtchedUser } from '../models/etched-user';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TokenResponse } from './dtos/token-response';

describe('EtchedApiService', () => {
    let injector: TestBed;
    let service: EtchedApiService;
    let httpMock: HttpTestingController;

    const USER: EtchedUser = {
        username: 'abc',
        email: null,
        id: '123',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EtchedApiService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        injector = getTestBed();
        service = injector.get(EtchedApiService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should be created', () => {
        const service: EtchedApiService = TestBed.get(EtchedApiService);
        expect(service).toBeTruthy();
    });


    it('register', () => {
        service.register('abc', 'password', null)
            .subscribe(user => {
                expect(user.id).toEqual('123');
                expect(user.username).toEqual('abc');
                expect(user.email).toBeNull();
            });

        const req = httpMock.expectOne(`${environment.API_URL}/auth/register`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.has('Authorization')).toBeFalsy();
        req.flush(USER);
    });

    it('login saves token to be used later', () => {
        const tokenResponse: TokenResponse = {
            accessToken: 'access',
            expiresIn: 900,
            refreshExpiresIn: 1800,
            refreshToken: 'refresh',
        };

        service.login('user', 'password')
            .subscribe(() => {});

        const loginRequest = httpMock.expectOne(`${environment.API_URL}/auth/authenticate`);
        expect(loginRequest.request.method).toEqual('POST');
        expect(loginRequest.request.headers.has('Authorization')).toBeFalsy();
        loginRequest.flush(tokenResponse);

        // Now try and get the currently logged in user
        service.self()
            .subscribe(u => {
                expect(u.email).toBeNull();
                expect(u.username).toEqual('abc');
                expect(u.id).toEqual('123');
            });

        const selfRequest = httpMock.expectOne(`${environment.API_URL}/auth/self`);
        expect(selfRequest.request.method).toEqual('GET');
        // Should use the access token it got from the login request
        expect(selfRequest.request.headers.get('Authorization')).toEqual(`Bearer access`);
        selfRequest.flush(USER);
    });

    it('token refreshes when close to expiry', () => {
        const tokenResponse: TokenResponse = {
            accessToken: 'access',
            expiresIn: -1000, // set expiry to a negative so that it refreshes immediately
            refreshExpiresIn: 1800,
            refreshToken: 'refresh',
        };

        service.login('user', 'password')
            .subscribe(() => {});

        const loginRequest = httpMock.expectOne(`${environment.API_URL}/auth/authenticate`);
        loginRequest.flush(tokenResponse);

        // Try getting self, but because the token is near expiry it will refresh the token first
        service.self()
            .subscribe(u => {
                expect(u.username).toEqual('abc');
            });

        const refreshedTokenResponse: TokenResponse = {
            accessToken: 'access2',
            expiresIn: 900,
            refreshExpiresIn: 1800,
            refreshToken: 'refresh2',
        };
        const refreshRequest = httpMock.expectOne(`${environment.API_URL}/auth/refresh-token`);
        expect(refreshRequest.request.method).toEqual('POST');
        expect(refreshRequest.request.body).toEqual({'refreshToken': 'refresh'});
        refreshRequest.flush(refreshedTokenResponse);

        const selfRequest = httpMock.expectOne(`${environment.API_URL}/auth/self`);
        // Should use the refreshed access token it got from the refresh request
        expect(selfRequest.request.headers.get('Authorization')).toEqual(`Bearer access2`);
        selfRequest.flush(USER);
    });

    afterEach(() => {
        httpMock.verify();
    });
});
