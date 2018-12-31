import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ClockService {

    constructor() {
    }

    nowMillis(): number {
        return this.now().getTime();
    }

    now(): Date {
        return new Date();
    }
}
