import { Injectable } from '@angular/core';
import { action, computed, observable } from 'mobx-angular';
import { AbstractJournal } from '../models/journal/abstract-journal';
import { SimpleReader } from '../models/reader';
import { SimpleWriter } from '../models/writer';
import { EncrypterService } from '../services/encrypter.service';
import { EncryptedEntityRequest } from '../services/etched-api-utils';
import { JournalService, UpdateJournalReq } from '../services/journal.service';
import { JournalEntity } from '../services/models/journal-entity';

interface JournalAndEntity {
    journal: AbstractJournal;
    entity: JournalEntity;
}

@Injectable()
export class JournalStore {
    @observable public entities: JournalEntity[] = [];
    @observable public loading: boolean = false;
    @observable public loadedOnce: boolean = false;
    public journalsById: Map<string, AbstractJournal> = new Map<string, AbstractJournal>();

    constructor(
        private journalService: JournalService,
        private encrypterService: EncrypterService
    ) {
        encrypterService.encrypterObs.subscribe(() => this.initStore());
    }

    /**
     * Initialize the store
     *
     * MUST be called after the encrypter has been set otherwise journals cannot be decrypted
     */
    private async initStore() {
        await this.getJournals();
    }

    /**
     * Decrypted journals ordered in the same order as the journal entities
     */
    @computed
    public get journals(): AbstractJournal[] {
        const entityIds = this.entities.map(e => e.id);
        const journals = [];
        entityIds.forEach(id => {
            journals.push(this.journalsById.get(id));
        });
        return journals;
    }

    @action
    public async getJournals(): Promise<JournalEntity[]> {
        this.loading = true;

        const encrypted = await this.journalService.getJournals().toPromise();

        const entities: JournalEntity[] = [];
        for (const e of encrypted) {
            const result = await this.decryptAndReadJournal(e);
            this.journalsById.set(e.id, result.journal);
            entities.push(result.entity);
        }

        this.entities = entities;
        this.loading = false;
        this.loadedOnce = true;

        return entities;
    }

    private async decryptAndReadJournal(entity: JournalEntity): Promise<JournalAndEntity> {
        const encrypter = this.encrypterService.encrypter;
        const decrypted = await encrypter.decryptEntity(entity);
        const reader = SimpleReader.getReader<AbstractJournal>(entity.schema);
        const journal = reader.read(JSON.parse(decrypted.content));
        return { entity: decrypted, journal };
    }

    @action
    public async createJournal(journal: AbstractJournal): Promise<JournalEntity> {
        const ciphertext = await this.encrypt(journal);
        const req: EncryptedEntityRequest = {
            keyPairId: this.encrypterService.encrypter.keyPairId,
            content: ciphertext,
            schema: journal.schema,
        };
        return await this.journalService.createJournal(req).toPromise();
    }

    @action
    public async updateJournal(id: string, journal: AbstractJournal): Promise<JournalEntity> {
        const ciphertext = await this.encrypt(journal);
        const req: UpdateJournalReq = {
            entityReq: {
                keyPairId: this.encrypterService.encrypter.keyPairId,
                content: ciphertext,
                schema: journal.schema,
            },
            journalId: id,
        };

        const encryptedEntity = await this.journalService.updateJournal(req).toPromise();
        const journalAndEntity = await this.decryptAndReadJournal(encryptedEntity);

        this.updateJournalState(journalAndEntity);
        return journalAndEntity.entity;
    }

    private async encrypt(journal: AbstractJournal) {
        const enc = this.encrypterService.encrypter;
        const writer = SimpleWriter.getWriter<AbstractJournal>(journal.schema);
        const blobified = writer.write(journal);
        return await enc.encrypt(blobified);
    }

    private updateJournalState(journalAndEntity: JournalAndEntity) {
        const entity = journalAndEntity.entity;
        const updateIndex = this.entities.findIndex(e => e.id === entity.id);
        if (updateIndex >= 0) {
            this.entities[updateIndex] = entity;
        } else {
            this.entities.push(entity);
        }
        this.journalsById.set(entity.id, journalAndEntity.journal);
    }
}
