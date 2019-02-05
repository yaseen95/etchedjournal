import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { EntryEntity } from '../models/entry-entity';
import { EncrypterService } from '../services/encrypter.service';
import { EntriesService } from '../services/entries.service';

@Injectable()
export class EntryStore {

    @mobx.observable entries: EntryEntity[] = [];
    @mobx.observable loading: boolean = false;

    constructor(private entryService: EntriesService,
                private encrypterService: EncrypterService) {
    }

    @mobx.action async loadEntries(journalId: string) {
        this.loading = true;
        const entries = await this.entryService.getEntries(journalId).toPromise();
        await this.decryptEntries(entries);
    }

    async decryptEntries(encrypted: EntryEntity[]) {
        const enc = this.encrypterService.encrypter;
        console.info('decrypting entries');
        const decrypted = await enc.decryptEntities(encrypted);
        console.info('decrypted entries');
        this.loadedEntries(decrypted);
    }

    @mobx.action loadedEntries(entries: EntryEntity[]) {
        this.entries = entries;
        this.loading = false;
        console.info('loaded and decrypted entries');
    }

    @mobx.action async createEntry(journalId: string, title: string): Promise<EntryEntity> {
        const enc = this.encrypterService.encrypter;
        const ciphertext = await enc.encrypt(title);
        return await this.entryService.createEntry(enc.keyPairId, journalId,
            ciphertext).toPromise();
    }
}
