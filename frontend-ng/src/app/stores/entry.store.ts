import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { AbstractEntry } from '../models/entry/abstract-entry';
import { EntryV1 } from '../models/entry/entry-v1';
import { SimpleReader } from '../models/reader';
import { Version } from '../models/version';
import { SimpleWriter } from '../models/writer';
import { EncrypterService } from '../services/encrypter.service';
import { CreateEntryRequest, EntriesService } from '../services/entries.service';
import { EncryptedEntityRequest } from '../services/etched-api-utils';
import { EntryEntity } from '../services/models/entry-entity';

interface EntryAndEntity {
    entity: EntryEntity;
    entry: AbstractEntry;
}

@Injectable()
export class EntryStore {
    @mobx.observable public entities: EntryEntity[] = [];
    @mobx.observable public entries: AbstractEntry[] = [];
    @mobx.observable public loading: boolean = false;
    public entriesById: Map<string, AbstractEntry> = new Map();

    constructor(private entryService: EntriesService, private encrypterService: EncrypterService) {}

    @mobx.action
    public async loadEntries(journalId: string) {
        this.loading = true;
        const encrypted = await this.entryService.getEntries(journalId).toPromise();

        const decrypted: AbstractEntry[] = [];
        const entities: EntryEntity[] = [];
        for (const e of encrypted) {
            const result = await this.decryptAndReadEntry(e);
            this.entriesById.set(e.id, result.entry);
            decrypted.push(result.entry);
            entities.push(result.entity);
        }
        // Do a complete replacement of entries and entities
        // TODO Figure out how to handle pagination with this model
        this.entries = decrypted;
        this.entities = entities;
        this.loading = false;
    }

    private async decryptAndReadEntry(entity: EntryEntity): Promise<EntryAndEntity> {
        const encrypter = this.encrypterService.encrypter;
        const decrypted = await encrypter.decryptEntity(entity);
        const version = Version.from(entity.schema);
        const reader = SimpleReader.getReader<EntryV1>(version);
        const entry = reader.read(JSON.parse(decrypted.content));
        return { entity: decrypted, entry };
    }

    @mobx.action
    public async loadEntry(entryId: string): Promise<EntryEntity> {
        this.loading = true;
        const encrypted = await this.entryService.getEntry(entryId).toPromise();
        const result = await this.decryptAndReadEntry(encrypted);
        // TODO Should we update `this.entries` and `this.entities`?
        this.entriesById.set(entryId, result.entry);
        this.loading = false;
        return result.entity;
    }

    @mobx.action
    public async createEntry(journalId: string, entry: AbstractEntry): Promise<EntryEntity> {
        const enc = this.encrypterService.encrypter;

        const writer = SimpleWriter.getWriter<EntryV1>(Version.from(entry.version));
        // Can safely cast as long as the writer above is `EntryV1Writer`. Will break if we add
        // a new writer.
        const blobified = writer.write(entry as EntryV1);
        const ciphertext = await enc.encrypt(blobified);

        const encEntity: EncryptedEntityRequest = {
            content: ciphertext,
            keyPairId: enc.keyPairId,
            schema: '1.0.0',
        };
        const req: CreateEntryRequest = { journalId, entry: encEntity };
        // TODO should we add it to `entries` first?
        return this.entryService.createEntry(req).toPromise();
    }
}
