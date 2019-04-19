import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { AbstractEtch, EtchV1 } from '../models/etch/etch';
import { EncrypterService } from '../services/encrypter.service';
import { EncryptedEntityRequest } from '../services/etched-api-utils';
import { CreateEtchesRequest, EtchesService } from '../services/etches.service';
import { EtchEntity } from '../services/models/etch-entity';

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

        const encEntity: EncryptedEntityRequest = {
            content: ciphertext,
            keyPairId: enc.keyPairId,
            schema: '1.0.0',
        };
        const req: CreateEtchesRequest = { entryId, etches: [encEntity] };
        return this.etchService.postEtches(req).toPromise();
    }
}
