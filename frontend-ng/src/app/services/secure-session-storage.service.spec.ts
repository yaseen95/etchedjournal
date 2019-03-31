import { TestBed } from '@angular/core/testing';

import { SecureStorageService } from './secure-storage.service';

describe('SecureStorageService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    // TODO: Add tests for this
    it('should be created', () => {
        const service: SecureStorageService = TestBed.get(SecureStorageService);
        expect(service).toBeTruthy();
    });
});
