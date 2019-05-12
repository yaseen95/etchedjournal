import { Injectable } from '@angular/core';
import { action, observable } from 'mobx-angular';
import { AbstractEtch } from '../../models/etch/abstract-etch';

import { EncrypterService } from '../../services/encrypter.service';
import { CreateEtchesRequest, EtchService } from '../../services/etch.service';
import { EncryptedEntityRequest } from '../../services/etched-api-utils';
import { EtchEntity } from '../../services/models/etch-entity';
import { Schema } from '../../services/models/schema';
import { MultiMap } from '../../utils/multi-map';
import { removeDuplicates } from '../../utils/object-utils';
import { EtchDecryptingReader } from './etch-decrypting-reader';
import { EtchEncryptingWriter } from './etch-encrypting-writer';
import { EtchQueue } from './etch-queue';
import { EtchStateUpdater } from './etch-state-updater';

export interface EtchesAndEntity {
    etches: AbstractEtch[];
    entity: EtchEntity;
}

@Injectable({ providedIn: 'root' })
export class EtchStore {
    @observable public entities: EtchEntity[] = [];
    @observable public etchesById: Map<string, AbstractEtch[]> = new Map();
    @observable public loading: boolean = false;
    // This is updated by the UI and may be updated after network requests
    @observable public etchesByEntry: MultiMap<string, AbstractEtch> = new MultiMap();

    constructor(
        private service: EtchService,
        private encrypter: EncrypterService,
        private queue: EtchQueue,
        private reader: EtchDecryptingReader,
        private writer: EtchEncryptingWriter
    ) {
        queue.queueObs.subscribe(queued => {
            this.postQueuedEtches(queued);
        });
    }

    @action
    public async getEtches(entryId: string): Promise<EtchEntity[]> {
        this.loading = true;
        const encrypted = await this.service.getEtches(entryId).toPromise();
        const decrypted = await this.reader.read(encrypted);
        EtchStateUpdater.update(this, decrypted);
        this.loading = false;
        return decrypted.map(e => e.entity);
    }

    @action
    async createEtches(entryId: string, etches: AbstractEtch[]): Promise<EtchEntity[]> {
        const ciphertext = await this.writer.write(etches);
        const encEntity: EncryptedEntityRequest = {
            content: ciphertext,
            keyPairId: this.encrypter.encrypter.keyPairId,
            schema: Schema.V1_0,
        };
        const req: CreateEtchesRequest = { entryId, etches: [encEntity] };

        const encrypted = await this.service.postEtches(req).toPromise();
        const decrypted = await this.reader.read(encrypted);
        EtchStateUpdater.update(this, decrypted);
        return decrypted.map(e => e.entity);
    }

    @action
    public addEtches(entryId: string, etches: AbstractEtch[]) {
        const uniqueEtches = removeDuplicates(etches);
        this.etchesByEntry.setMany(entryId, uniqueEtches);
        this.queue.put(entryId, uniqueEtches);
    }

    private postQueuedEtches(queued: MultiMap<string, AbstractEtch>) {
        for (const id of queued.keys()) {
            const etches = queued.get(id);
            this.createEtches(id, etches);
        }
    }
}
