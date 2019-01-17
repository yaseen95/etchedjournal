import { async, getTestBed, TestBed } from '@angular/core/testing';

import { HTTP_INTERCEPTORS, HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import {
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserSession,
    ISignUpResult
} from 'amazon-cognito-identity-js';
import { EMPTY, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { AUTH_REQUIRED_URLS } from '../services/etched-api.service';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
    let injector: TestBed;
    let httpMock: HttpTestingController;
    let service: AuthService;
    let httpClient: HttpClient;
    let interceptor: AuthInterceptor;

    beforeEach(async(() => {
        const accessTokenSpy = jasmine.createSpyObj('AccessToken', ['getJwtToken']);
        accessTokenSpy.getJwtToken.and.returnValue('token');

        const sessionSpy = jasmine.createSpyObj('CognitoUserSession', ['getAccessToken']);
        sessionSpy.getAccessToken.and.returnValue(accessTokenSpy);

        const authSpy = jasmine.createSpyObj('AuthService', ['refreshIfExpired']);
        authSpy.refreshIfExpired.and.returnValue(Promise.resolve(sessionSpy));

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {provide: AuthService, useValue: authSpy},
                {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
                AuthInterceptor,
            ],
        });

        injector = getTestBed();
        service = injector.get(AuthService);
        httpMock = injector.get(HttpTestingController);
        httpClient = injector.get(HttpClient);
        interceptor = injector.get(AuthInterceptor);
    }));

    it('attempts to refresh tokens for paths requiring auth', () => {
        const url = AUTH_REQUIRED_URLS[0];
        const req = new HttpRequest<any>('GET', url, null, {headers: new HttpHeaders()});
        const cloneSpy = spyOn(req, 'clone');
        const handlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);
        handlerSpy.handle.and.returnValue(of(EMPTY));

        interceptor.intercept(req, handlerSpy)
            .subscribe(() => {
                expect(service.refreshIfExpired).toHaveBeenCalledTimes(1);
                expect(handlerSpy.handle).toHaveBeenCalledTimes(1);
                expect(cloneSpy).toHaveBeenCalledTimes(1);
            });
    });

    it('does not attempt to refresh tokens for paths requiring auth', () => {
        const req = new HttpRequest<any>('GET', '', null, {headers: new HttpHeaders()});
        const handlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);
        handlerSpy.handle.and.returnValue(of(EMPTY));

        interceptor.intercept(req, handlerSpy)
            .subscribe(() => {
                expect(service.refreshIfExpired).toHaveBeenCalledTimes(0);
                expect(handlerSpy.handle).toHaveBeenCalledTimes(1);
            });
    });

    it('interceptor adds token', () => {
        const url = AUTH_REQUIRED_URLS[0];
        const req = new HttpRequest<any>('GET', url, null, {headers: new HttpHeaders()});
        const cloneSpy = spyOn(req, 'clone').and.callThrough();
        const handlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);
        handlerSpy.handle.and.returnValue(of(EMPTY));

        interceptor.intercept(req, handlerSpy)
            .subscribe(() => {
                expect(cloneSpy).toHaveBeenCalledTimes(1);
                const interceptedReq: HttpRequest<any> = handlerSpy.handle.calls.argsFor(0)[0];
                expect(interceptedReq.headers.get('Authorization')).toEqual('Bearer token');
            });
    });

    it('journals path requires auth', () => {
        const result = AuthInterceptor.requiresAuth(`${environment.API_URL}/journals`);
        expect(result).toBeTruthy();
    });

    it('empty path should not require auth', () => {
        const result = AuthInterceptor.requiresAuth('');
        expect(result).toBeFalsy();
    });

    afterEach(() => {
        // Verify that there aren't any outstanding requests
        httpMock.verify();
    });
});
