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
import { EntryEntity } from '../models/entry-entity';
import { OwnerType } from '../models/owner-type';

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
            accessToken: 'foobar',
            expiresIn: 900,
            refreshExpiresIn: 1800,
            refreshToken: 'refresh',
        };

        service.login('user', 'password')
            .subscribe(() => {
            });

        const loginRequest = httpMock.expectOne(`${environment.API_URL}/auth/authenticate`);
        expect(loginRequest.request.method).toEqual('POST');
        expect(loginRequest.request.headers.has('Authorization')).toBeFalsy();
        loginRequest.flush(tokenResponse);

        // Login automatically invokes self() after it receives the auth tokens
        const selfRequest = httpMock.expectOne(`${environment.API_URL}/auth/self`);
        expect(selfRequest.request.method).toEqual('GET');
        // Should use the access token it got from the login request
        expect(selfRequest.request.headers.get('Authorization')).toEqual(`Bearer foobar`);
        selfRequest.flush(USER);
    });

    it('token refreshes when close to expiry', () => {
        const tokenResponse: TokenResponse = {
            accessToken: 'access',
            expiresIn: -1000, // set expiry to a negative so that it refreshes immediately
            refreshExpiresIn: 1800,
            refreshToken: 'refresh',
        };

        // When the login response is received, the EtchedApiService will send a request to get the
        // user details (by invoking self()). That should trigger the refresh.
        service.login('user', 'password')
            .subscribe(() => {
            });

        const loginRequest = httpMock.expectOne(`${environment.API_URL}/auth/authenticate`);
        loginRequest.flush(tokenResponse);

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
        // Verify that there aren't any outstanding requests
        httpMock.verify();
    });

    it('create entry', () => {
        initAuth();
        service.createEntry('content')
            .subscribe(entry => {
                expect(entry.id).toEqual('entryId');
                expect(entry.content).toEqual('base64Content');
                expect(entry.timestamp).toEqual(1);
                expect(entry.owner).toEqual('user');
                expect(entry.ownerType).toEqual(OwnerType.USER);
            });

        const entry: EntryEntity = {
            id: 'entryId',
            content: 'base64Content',
            timestamp: 1,
            owner: 'user',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: 'USER' as OwnerType,
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        req.flush(entry);
    });

    /**
     * Util that initializes auth so that other tests can skip it
     */
    function initAuth() {
        const tokenResponse: TokenResponse = {
            accessToken: 'access',
            expiresIn: 900,
            refreshExpiresIn: 1800,
            refreshToken: 'refresh',
        };

        service.login('user', 'password')
            .subscribe(() => {});

        const loginRequest = httpMock.expectOne(`${environment.API_URL}/auth/authenticate`);
        loginRequest.flush(tokenResponse);

        // Login automatically invokes self() after it receives the auth tokens
        const selfRequest = httpMock.expectOne(`${environment.API_URL}/auth/self`);
        selfRequest.flush(USER);
    }
});
