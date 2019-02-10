import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Encrypter } from './encrypter';

@Injectable({
    providedIn: 'root',
})
export class EncrypterService {
    private enc: Encrypter = null;

    /**
     * Broadcasts when encrypter has been set
     *
     * Used as a gate to trigger getting/decrypting encrypted entities.
     */
    public encrypterObs: Subject<Encrypter>;

    constructor() {
        this.encrypterObs = new Subject();
    }

    get encrypter(): Encrypter | null {
        return this.enc;
    }

    set encrypter(e: Encrypter) {
        if (e === null || e === undefined) {
            throw new Error('Encrypter cannot be null');
        }
        this.enc = e;
        this.encrypterObs.next(e);
    }
}
