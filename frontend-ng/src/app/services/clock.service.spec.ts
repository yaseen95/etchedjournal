import { TestBed } from '@angular/core/testing';

import { ClockService } from './clock.service';

describe('ClockService', () => {
    let service: ClockService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.get(ClockService);
    });

    it('now is recent', () => {
        const start = new Date().getTime();
        const actual = service.now();
        const end = new Date().getTime();

        expect(start).toBeLessThanOrEqual(actual.getTime());
        expect(end).toBeGreaterThanOrEqual(actual.getTime());
    });

    it('nowMillis is recent', () => {
        const start = new Date().getTime();
        const actual = service.nowMillis();
        const end = new Date().getTime();

        expect(start).toBeLessThanOrEqual(actual);
        expect(end).toBeGreaterThanOrEqual(actual);
    });
});
