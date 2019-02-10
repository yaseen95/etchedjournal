import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserSession,
    ISignUpResult,
} from 'amazon-cognito-identity-js';
import { environment } from '../../environments/environment';
import { EtchedUser } from '../models/etched-user';
import { TestUtils } from '../utils/test-utils.spec';
import { RandomUtils } from '../utils/text-utils';
import { IdToken, TokenDecoder } from '../utils/token-decoder';
import {
    AuthService,
    cognitoPrefix,
    LOCAL_COGNITO_PREFIX,
    UsernameTakenError,
} from './auth.service';
import { FakeClock } from './clock.service.spec';
import { CognitoAuthFactory } from './cognito-auth-factory';
import TEST_USER = TestUtils.TEST_USER;

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let authFactory: any;
    let mockAuth: any;
    let tokenDecoderSpy: any;

    beforeEach(() => {
        localStorage.clear();

        tokenDecoderSpy = spyOn(TokenDecoder, 'decodeToken');

        mockAuth = jasmine.createSpyObj('Auth', [
            'signIn',
            'signUp',
            'updateUserAttributes',
            'currentSession',
            'signOut',
        ]);

        authFactory = jasmine.createSpyObj('CognitoAuthFactory', ['create']);
        authFactory.create.and.returnValue(mockAuth);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService, { provide: CognitoAuthFactory, useValue: authFactory }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        const injector = getTestBed();
        service = injector.get(AuthService);
        httpMock = injector.get(HttpTestingController);
    });

    it('uses auth factory to create on init', () => {
        expect(authFactory.create).toHaveBeenCalledTimes(1);
    });

    it('extracts user details on init', () => {
        setUsernameInLocalStorage(TEST_USER, 'username');
        setIdTokenInLocalStorage('username');

        const token = {
            preferred_username: 'pref',
            sub: 'sub',
            exp: 0,
        };
        tokenDecoderSpy.and.returnValue(token);

        const fakeClock = new FakeClock(0);
        const service2 = new AuthService(fakeClock, authFactory);

        const user = service2.getUser();
        expect(user).not.toBeNull();
        expect(user.username).toEqual('pref');
        expect(user.id).toEqual('sub');
    });

    it('refresh is valid within 29 days', () => {
        const token: IdToken = {
            preferred_username: 'pref',
            exp: 0, // expiry is seconds since epoch (not millis)
            sub: '',
            typ: '',
            iss: '',
            aud: '',
        };

        const clock = new FakeClock(0);
        expect(AuthService.refreshIsValid(token, clock)).toBeTruthy();

        clock.time += 29 * 24 * 60 * 60 * 1_000;
        expect(AuthService.refreshIsValid(token, clock)).toBeTruthy();

        // > 29 days now
        clock.time += 1;
        expect(AuthService.refreshIsValid(token, clock)).toBeFalsy();
    });

    it('register e2e', async () => {
        mockAuth.signUp.and.returnValue(Promise.resolve());

        const randomStrSpy = spyOn(RandomUtils, 'randomStr');
        randomStrSpy.and.returnValue('random');

        const token = { payload: { sub: 'userSubject' } };
        const session = { getIdToken: () => token };
        const signInResult = { getSignInUserSession: () => session };
        mockAuth.signIn.and.returnValue(Promise.resolve(signInResult));

        await service.register('samsepiol', 'password');
        const user = service.getUser();

        expect(user.username).toBe('samsepiol');
        expect(user.id).toBe('userSubject');
        expect(user.email).toBeNull();

        expect(mockAuth.signUp).toHaveBeenCalledTimes(1);
        expect(mockAuth.signUp).toHaveBeenCalledWith({ username: 'random', password: 'password' });

        expect(mockAuth.signIn).toHaveBeenCalledTimes(2);
        expect(mockAuth.signIn.calls.allArgs()).toEqual([
            ['samsepiol', 'abc'],
            ['random', 'password'],
        ]);

        expect(mockAuth.updateUserAttributes).toHaveBeenCalledWith(signInResult, {
            preferred_username: 'samsepiol',
        });
    });

    it('login signs in and sets user', async () => {
        const token = { payload: { sub: '12345', preferred_username: 'cisco' } };
        const session = { getIdToken: () => token };
        const signInResult = { getSignInUserSession: () => session };
        mockAuth.signIn.and.returnValue(Promise.resolve(signInResult));

        await service.login('cisco', 'password');
        const user = service.getUser();

        expect(user.username).toBe('cisco');
        expect(user.id).toBe('12345');
        expect(user.email).toBeNull();

        expect(mockAuth.signIn).toHaveBeenCalledTimes(1);
        expect(mockAuth.signIn).toHaveBeenCalledWith('cisco', 'password');
    });

    it('logout signs out and resets user', async () => {
        // perform a login to set the user first
        const token = { payload: { sub: '123', preferred_username: 'samsepiol' } };
        const session = { getIdToken: () => token };
        const signInResult = { getSignInUserSession: () => session };
        mockAuth.signIn.and.returnValue(Promise.resolve(signInResult));
        await service.login('cisco', 'password');
        expect(service.getUser()).not.toBeNull();

        // log the user out
        mockAuth.signOut.and.returnValue(Promise.resolve());
        await service.logout();
        expect(service.getUser()).toBeNull();
        expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it('logout clears local storage', async () => {
        // TODO: Should we clear local storage on logout?
        localStorage.setItem('foo', 'bar');
        localStorage.setItem('bar', 'baz');
        mockAuth.signOut.and.returnValue(Promise.resolve());
        await service.logout();
        expect(Object.keys(localStorage).length).toEqual(0);
    });

    it('refreshIfExpired refreshes tokens', async () => {
        mockAuth.currentSession.and.returnValue(Promise.resolve({}));
        await service.refreshIfExpired();
        expect(mockAuth.currentSession).toHaveBeenCalledTimes(1);
    });

    it('register checks if username is taken first', async () => {
        const existsSpy = spyOn(service, 'userExists');
        existsSpy.and.returnValue(Promise.resolve(true));

        try {
            await service.register('samsepiol', 'password');
            fail('Expected register to throw');
        } catch (e) {
            expect(e.message).toEqual(UsernameTakenError.MESSAGE);
        }
    });

    it('userExists true', async () => {
        const err = { code: 'NotAuthorizedException', message: 'Incorrect username or password.' };
        mockAuth.signIn.and.returnValue(Promise.reject(err));
        const result = await service.userExists('samsepiol');
        expect(result).toBeTruthy();
    });

    it('userExists false', async () => {
        const err = { code: 'UserNotFoundException', message: 'User does not exist.' };
        mockAuth.signIn.and.returnValue(Promise.reject(err));
        const result = await service.userExists('samsepiol');
        expect(result).toBeFalsy();
    });

    it('userExists attempts to sign in with invalid password', async () => {
        const err = { code: 'UserNotFoundException', message: 'User does not exist.' };
        mockAuth.signIn.and.returnValue(Promise.reject(err));

        await service.userExists('samsepiol');

        expect(mockAuth.signIn).toHaveBeenCalledTimes(1);
        // signs in with known invalid password 'abc'
        // passwords are configured to be at least 8 characters
        expect(mockAuth.signIn).toHaveBeenCalledWith('samsepiol', 'abc');
    });

    it('isInvalidCredentialsError true', () => {
        const error = {
            code: 'NotAuthorizedException',
            message: 'Incorrect username or password.',
        };
        expect(AuthService.isInvalidCredentialsError(error)).toBeTruthy();
    });

    it('isInvalidCredentialsError false', () => {
        // should not throw if code and message don't match
        const error = { code: 'NotAuthorizedException', message: 'baz' };
        expect(AuthService.isInvalidCredentialsError(error)).toBeFalsy();
    });

    it('isInvalidCredentialsError true', () => {
        const error = { code: 'UserNotFoundException', message: 'User does not exist.' };
        expect(AuthService.isUserNotFoundError(error)).toBeTruthy();
    });

    it('isInvalidCredentialsError false', () => {
        // should not throw if code and message don't match
        const error = { code: 'UserNotFoundException', message: 'baz' };
        expect(AuthService.isUserNotFoundError(error)).toBeFalsy();
    });
});

function setUsernameInLocalStorage(user: EtchedUser, username: string) {
    const userKey = `${cognitoPrefix()}.LastAuthUser`;
    localStorage.setItem(userKey, username);
}

function setIdTokenInLocalStorage(username: string) {
    const idTokenKey = `${cognitoPrefix()}.${username}.idToken`;
    localStorage.setItem(idTokenKey, 'token');
}
