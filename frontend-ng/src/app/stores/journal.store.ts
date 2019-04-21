import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { AbstractJournal } from '../models/journal/abstract-journal';
import { SimpleReader } from '../models/reader';
import { SimpleWriter } from '../models/writer';
import { EncrypterService } from '../services/encrypter.service';
import { EncryptedEntityRequest } from '../services/etched-api-utils';
import { JournalsService } from '../services/journals.service';
import { JournalEntity } from '../services/models/journal-entity';

interface JournalAndEntity {
    journal: AbstractJournal;
    entity: JournalEntity;
}

@Injectable()
export class JournalStore {
    @mobx.observable public entities: JournalEntity[] = [];
    @mobx.observable public journals: AbstractJournal[] = [];
    @mobx.observable public loading: boolean = false;
    @mobx.observable public loadedOnce: boolean = false;
    public journalsById: Map<string, AbstractJournal> = new Map<string, AbstractJournal>();

    constructor(
        private journalsService: JournalsService,
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
        // noinspection JSIgnoredPromiseFromCall
        await this.loadJournals();
    }

    @mobx.action
    public async loadJournals(): Promise<JournalEntity[]> {
        this.loading = true;

        const encrypted = await this.journalsService.getJournals().toPromise();

        const journals: AbstractJournal[] = [];
        const entities: JournalEntity[] = [];
        for (const e of encrypted) {
            const result = await this.decryptAndReadJournal(e);
            this.journalsById.set(e.id, result.journal);
            entities.push(result.entity);
            journals.push(result.journal);
        }

        this.journals = journals;
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

    @mobx.action
    public async createJournal(journal: AbstractJournal): Promise<JournalEntity> {
        const enc = this.encrypterService.encrypter;
        const writer = SimpleWriter.getWriter<AbstractJournal>(journal.schema);
        const blobified = writer.write(journal);
        const ciphertext = await enc.encrypt(blobified);

        const req: EncryptedEntityRequest = {
            keyPairId: enc.keyPairId,
            content: ciphertext,
            schema: journal.schema,
        };
        return await this.journalsService.createJournal(req).toPromise();
    }
}
