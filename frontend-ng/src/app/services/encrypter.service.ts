import { Injectable } from '@angular/core';
import { Encrypter } from './encrypter';

@Injectable({
    providedIn: 'root'
})
export class EncrypterService {

    private _encrypter: Encrypter = null;

    constructor() {
    }

    get encrypter(): Encrypter | null {
        return this._encrypter;
    }

    set encrypter(e: Encrypter) {
        if (e === null || e === undefined) {
            throw new Error('Encrypter cannot be null');
        }
        this._encrypter = e;
    }
}
