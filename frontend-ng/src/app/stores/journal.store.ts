import { Injectable } from '@angular/core';
import * as mobx from 'mobx-angular';
import { switchMap } from 'rxjs/operators';
import { JournalEntity } from '../models/journal-entity';
import { EncrypterService } from '../services/encrypter.service';
import { JournalsService } from '../services/journals.service';

@Injectable()
export class JournalStore {

    @mobx.observable journals: JournalEntity[] = [];
    @mobx.observable loading: boolean = false;
    @mobx.observable loadedOnce: boolean = false;

    constructor(private journalsService: JournalsService,
                private encrypterService: EncrypterService) {
    }

    @mobx.action loadJournals() {
        this.loading = true;
        console.info('loading journals');

        this.journalsService.getJournals()
            .subscribe(journals => {
                console.info('fetched journals');
                // noinspection JSIgnoredPromiseFromCall
                this.decryptJournals(journals);
            });
    }

    async decryptJournals(encrypted: JournalEntity[]) {
        const enc = this.encrypterService.encrypter;
        console.info('decrypting journals');
        const decrypted = await enc.decryptEntities(encrypted);
        console.info('decrypted journals');
        this.loadedJournals(decrypted);
    }

    @mobx.action loadedJournals(journals: JournalEntity[]) {
        this.journals = journals;
        this.loading = false;
        this.loadedOnce = true;
        console.info('loaded and decrypted journals');
    }

    @mobx.action async createJournal(name: string): Promise<JournalEntity> {
        const enc = this.encrypterService.encrypter;
        const ciphertext = await enc.encrypt(name);
        const j = await this.journalsService.createJournal(enc.keyPairId, ciphertext).toPromise();
        // Fetch the journals again to update the navbar
        this.loadJournals();
        return j;
    }
}
