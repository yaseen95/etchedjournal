import { TestBed } from '@angular/core/testing';

import { EncrypterService } from './encrypter.service';

describe('EncrypterService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: EncrypterService = TestBed.get(EncrypterService);
        expect(service).toBeTruthy();
    });

    it('encrypter should be null by default', () => {
        const service: EncrypterService = TestBed.get(EncrypterService);
        expect(service.encrypter).toBeNull();
    });

    it('set encrypter null should throw', () => {
        const service: EncrypterService = TestBed.get(EncrypterService);
        expect(() => {
            service.encrypter = null;
        }).toThrow(new Error('Encrypter cannot be null'));
    });

    it('set encrypter undefined should throw', () => {
        const service: EncrypterService = TestBed.get(EncrypterService);
        expect(() => {
            service.encrypter = undefined;
        }).toThrow(new Error('Encrypter cannot be null'));
    });

    it('set and get returns set encrypter', () => {
        const service: EncrypterService = TestBed.get(EncrypterService);
        service.encrypter = { foo: 'bar' } as any;
        expect((service.encrypter as any).foo).toEqual('bar');
    });

    it('emits encrypter after it is set', () => {
        let retrieved = false;
        const service: EncrypterService = TestBed.get(EncrypterService);
        service.encrypterObs.subscribe(e => {
            expect((e as any).foo).toEqual('bar');
            retrieved = true;
        });
        // Do we need to add tick?
        service.encrypter = { foo: 'bar' } as any;
        expect(retrieved).toBe(true);
    });
});
