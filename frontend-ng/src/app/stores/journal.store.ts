import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { JournalEntity } from '../models/journal-entity';
import { EncrypterService } from '../services/encrypter.service';
import { EncryptedEntityRequest } from '../services/etched-api-utils';
import { JournalsService } from '../services/journals.service';

@Injectable()
export class JournalStore {
    @mobx.observable public journals: JournalEntity[] = [];
    @mobx.observable public loading: boolean = false;
    @mobx.observable public loadedOnce: boolean = false;

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
    private initStore() {
        this.loadJournals();
    }

    @mobx.action
    public loadJournals() {
        this.loading = true;
        console.info('loading journals');

        this.journalsService.getJournals().subscribe(journals => {
            console.info('fetched journals');
            // noinspection JSIgnoredPromiseFromCall
            this.decryptJournals(journals);
        });
    }

    public async decryptJournals(encrypted: JournalEntity[]) {
        const enc = this.encrypterService.encrypter;
        console.info('decrypting journals');
        const decrypted = await enc.decryptEntities(encrypted);
        console.info('decrypted journals');
        this.loadedJournals(decrypted);
    }

    @mobx.action
    public loadedJournals(journals: JournalEntity[]) {
        this.journals = journals;
        this.loading = false;
        this.loadedOnce = true;
        console.info('loaded and decrypted journals');
    }

    @mobx.action
    public async createJournal(name: string): Promise<JournalEntity> {
        const enc = this.encrypterService.encrypter;
        const ciphertext = await enc.encrypt(name);
        const req: EncryptedEntityRequest = {
            keyPairId: enc.keyPairId,
            content: ciphertext,
            schema: '1.0.0'
        };
        const j = await this.journalsService.createJournal(req).toPromise();
        // Fetch the journals again to update the navbar
        this.loadJournals();
        return j;
    }
}
