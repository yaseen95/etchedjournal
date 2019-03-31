import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { AbstractEtch, EtchV1 } from '../models/etch';
import { EtchEntity } from '../models/etch-entity';
import { EncrypterService } from '../services/encrypter.service';
import { EtchesService } from '../services/etches.service';

export interface State {
    etches: EtchEntity[];
    parsedEtches: EtchV1[];
    loading: boolean;
}

@Injectable()
export class EtchStore {
    @mobx.observable public state: State = {
        etches: [],
        parsedEtches: [],
        loading: false,
    };

    constructor(private etchService: EtchesService, private encrypterService: EncrypterService) {}

    @mobx.action
    public async loadEtches(entryId: string) {
        this.state.loading = true;
        // this.state.etches = [];
        // this.state.parsedEtches = [];
        const etches = await this.etchService.getEtches(entryId).toPromise();
        await this.decryptEtches(etches);
    }

    public async decryptEtches(encrypted: EtchEntity[]) {
        const enc = this.encrypterService.encrypter;
        console.info('decrypting etches');
        const decrypted = await enc.decryptEntities(encrypted);
        console.info('decrypted etches');
        this.loadedEtches(decrypted);
    }

    @mobx.action
    public loadedEtches(etches: EtchEntity[]) {
        // this.state.loading = true;
        const parsed = [];
        const rawEtches = etches.map(e => e.content);
        for (const rawBatch of rawEtches) {
            const batch: EtchV1[] = JSON.parse(rawBatch);
            parsed.push(...batch);
        }
        this.state.etches = etches;
        this.state.parsedEtches = parsed;
        console.info('loaded and decrypted etches');
        this.state.loading = false;
    }

    @mobx.action
    public async createEtches(entryId: string, etches: AbstractEtch[]): Promise<EtchEntity[]> {
        const enc = this.encrypterService.encrypter;
        const dump = JSON.stringify(etches);
        const ciphertext = await enc.encrypt(dump);
        return this.etchService.postEtches(enc.keyPairId, entryId, [ciphertext]).toPromise();
    }
}
