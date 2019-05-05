import { Injectable } from '@angular/core';
import { action, observable } from 'mobx-angular';
import { AbstractEntry } from '../models/entry/abstract-entry';
import { EntryV1 } from '../models/entry/entry-v1';
import { SimpleReader } from '../models/reader';
import { SimpleWriter } from '../models/writer';
import { EncrypterService } from '../services/encrypter.service';
import { CreateEntryRequest, EntryService, UpdateEntryReq } from '../services/entry.service';
import { EncryptedEntityRequest } from '../services/etched-api-utils';
import { EntryEntity } from '../services/models/entry-entity';

interface EntryAndEntity {
    entity: EntryEntity;
    entry: AbstractEntry;
}

@Injectable()
export class EntryStore {
    @observable public entities: EntryEntity[] = [];
    @observable public loading: boolean = false;
    public entriesById: Map<string, AbstractEntry> = new Map();

    constructor(private entryService: EntryService, private encrypterService: EncrypterService) {}

    @action
    public async getEntries(journalId: string) {
        this.loading = true;
        const encrypted = await this.entryService.getEntries(journalId).toPromise();

        const entities: EntryEntity[] = [];
        for (const e of encrypted) {
            const result = await this.decryptAndReadEntry(e);
            this.entriesById.set(e.id, result.entry);
            entities.push(result.entity);
        }
        // Do a complete replacement of entries and entities
        // TODO Figure out how to handle pagination with this model
        this.entities = entities;
        this.loading = false;
    }

    private async decryptAndReadEntry(entity: EntryEntity): Promise<EntryAndEntity> {
        const encrypter = this.encrypterService.encrypter;
        const decrypted = await encrypter.decryptEntity(entity);
        const reader = SimpleReader.getReader<EntryV1>(entity.schema);
        const entry = reader.read(JSON.parse(decrypted.content));
        return { entity: decrypted, entry };
    }

    @action
    public async getEntry(entryId: string): Promise<EntryEntity> {
        this.loading = true;
        const encrypted = await this.entryService.getEntry(entryId).toPromise();
        const result = await this.decryptAndReadEntry(encrypted);
        // TODO Should we update `this.entries` and `this.entities`?
        this.entriesById.set(entryId, result.entry);
        this.loading = false;
        return result.entity;
    }

    @action
    public async createEntry(journalId: string, entry: AbstractEntry): Promise<EntryEntity> {
        const ciphertext = await this.encrypt(entry);
        const encEntity: EncryptedEntityRequest = {
            content: ciphertext,
            keyPairId: this.encrypterService.encrypter.keyPairId,
            schema: entry.schema,
        };
        const req: CreateEntryRequest = { journalId, entry: encEntity };
        const entity = await this.entryService.createEntry(req).toPromise();
        this.updateEntryState({ entity, entry });
        return entity;
    }

    @action
    public async updateEntry(id: string, entry: AbstractEntry): Promise<EntryEntity> {
        const ciphertext = await this.encrypt(entry);
        const req: UpdateEntryReq = {
            entityReq: {
                keyPairId: this.encrypterService.encrypter.keyPairId,
                content: ciphertext,
                schema: entry.schema,
            },
            entryId: id,
        };

        const encryptedEntity = await this.entryService.updateEntry(req).toPromise();
        const entryAndEntity = await this.decryptAndReadEntry(encryptedEntity);

        this.updateEntryState(entryAndEntity);
        return entryAndEntity.entity;
    }

    private async encrypt(entry: AbstractEntry) {
        const enc = this.encrypterService.encrypter;
        const writer = SimpleWriter.getWriter<AbstractEntry>(entry.schema);
        const blobified = writer.write(entry);
        return await enc.encrypt(blobified);
    }

    private updateEntryState(entryAndEntity: EntryAndEntity) {
        const entity = entryAndEntity.entity;
        const updateIndex = this.entities.findIndex(e => e.id === entity.id);
        if (updateIndex >= 0) {
            this.entities[updateIndex] = entity;
        } else {
            this.entities.push(entity);
        }
        this.entriesById.set(entity.id, entryAndEntity.entry);
    }
}
