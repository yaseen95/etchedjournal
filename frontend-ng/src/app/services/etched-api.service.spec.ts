import { getTestBed, TestBed } from '@angular/core/testing';

import { EtchedApiService } from './etched-api.service';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '../../../node_modules/@angular/common/http/testing';
import { EtchedUser } from '../models/etched-user';
import { environment } from '../../environments/environment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EtchedApiService', () => {
    let injector: TestBed;
    let service: EtchedApiService;
    let httpMock: HttpTestingController;

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
        const user: EtchedUser = {
            username: 'abc',
            email: null,
            id: '123',
        };

        service.register('abc', 'password', null)
            .subscribe(user => {
                expect(user.id).toEqual('123');
                expect(user.username).toEqual('abc');
                expect(user.email).toBeNull();
            });

        const req = httpMock.expectOne(`${environment.API_URL}/auth/register`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.headers.has('Authorization')).toBeFalsy();
        req.flush(user);
    });

    afterEach(() => {
        httpMock.verify();
    });
});
