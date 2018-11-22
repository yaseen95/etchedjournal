import { getTestBed, TestBed } from '@angular/core/testing';

import { EtchedApiService } from './etched-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EtchedUser } from '../models/etched-user';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TokenResponse } from './dtos/token-response';
import { EntryEntity } from '../models/entry-entity';
import { OwnerType } from '../models/owner-type';
import { EtchEntity } from '../models/etch-entity';
import { KeyPairEntity } from '../models/key-pair-entity';

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

    it('post etches', () => {
        initAuth();

        service.postEtches('entryId', ['etch1', 'etch2'])
            .subscribe(etches => {
                expect(etches.length).toEqual(2);
                expect(etches[0].content).toEqual('etch1');
                expect(etches[1].content).toEqual('etch2');
            });

        const etches = new Array<EtchEntity>(2);
        etches[0] = {
            content: 'etch1',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 1,
            id: '1',
        };
        etches[1] = {
            content: 'etch2',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 2,
            id: '2',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries/entryId/etches`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        req.flush(etches);
    });

    it('get entries', () => {
        initAuth();

        service.getEntries()
            .subscribe(entries => {
                expect(entries.length).toEqual(2);
                expect(entries[0].content).toEqual('entry1');
                expect(entries[1].content).toEqual('entry2');
            });

        const entries = new Array<EntryEntity>(2);
        entries[0] = {
            content: 'entry1',
            // Declaring string `as OwnerType` because the API returns it as a string
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 1,
            id: '1',
        };
        entries[1] = {
            content: 'entry2',
            ownerType: OwnerType.USER,
            owner: 'abc',
            timestamp: 2,
            id: '2',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries`);
        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        req.flush(entries);
    });

    it('get entry', () => {
        initAuth();

        service.getEntry('entry1')
            .subscribe(entry => {
                expect(entry.id).toEqual('entry1');
                expect(entry.timestamp).toEqual(1);
                expect(entry.owner).toEqual('owner');
            });

        const entry = {
            content: 'content',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 1,
            id: 'entry1',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries/entry1`);
        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        req.flush(entry);
    });

    it('get etches', () => {
        initAuth();

        service.getEtches('entry1')
            .subscribe(etches => {
                expect(etches.length).toEqual(2);
                expect(etches[0].content).toEqual('etch1');
                expect(etches[1].content).toEqual('etch2');
            });

        const entries = new Array<EntryEntity>(2);
        entries[0] = {
            content: 'etch1',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 1,
            id: '1',
        };
        entries[1] = {
            content: 'etch2',
            ownerType: OwnerType.USER,
            owner: 'owner',
            timestamp: 2,
            id: '2',
        };

        const req = httpMock.expectOne(`${environment.API_URL}/entries/entry1/etches`);
        expect(req.request.method).toEqual('GET');
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        req.flush(entries);
    });

    it('createKeyPair', () => {
        initAuth();

        service.createKeyPair('pubKey', 'privKey')
            .subscribe(keyPair => {
                expect(keyPair.id).toEqual('id');
                expect(keyPair.owner).toEqual('owner');
                expect(keyPair.ownerType).toEqual('USER');
                expect(keyPair.privateKey).toEqual('privKey');
                expect(keyPair.publicKey).toEqual('pubKey');
                expect(keyPair.timestamp).toEqual(1);
            });

        const mockKeyPair: KeyPairEntity = {
            id: 'id',
            owner: 'owner',
            ownerType: OwnerType.USER,
            privateKey: 'privKey',
            publicKey: 'pubKey',
            timestamp: 1,
        };

        const req = httpMock.expectOne(`${environment.API_URL}/keypairs`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        req.flush(mockKeyPair);
    });

    afterEach(() => {
        // Verify that there aren't any outstanding requests
        httpMock.verify();
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
