import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocationService {
    public reload() {
        location.reload();
    }
}
