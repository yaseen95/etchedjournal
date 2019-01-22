import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocationService {

    constructor() {
    }

    reload() {
        location.reload();
    }
}
