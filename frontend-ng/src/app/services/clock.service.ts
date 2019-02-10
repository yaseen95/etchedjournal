import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ClockService {
    public nowMillis(): number {
        return this.now().getTime();
    }

    public now(): Date {
        return new Date();
    }
}
