import { TestBed } from '@angular/core/testing';

import { EtchedApiService } from './etched-api.service';

describe('EtchedApiService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: EtchedApiService = TestBed.get(EtchedApiService);
        expect(service).toBeTruthy();
    });
});
