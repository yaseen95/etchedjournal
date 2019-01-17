import { Component, OnInit } from '@angular/core';
import { Base64Str } from '../../../models/encrypted-entity';
import { EntryEntity } from '../../../models/entry-entity';
import { JournalEntity } from '../../../models/journal-entity';
import { Encrypter } from '../../../services/encrypter';
import { EncrypterService } from '../../../services/encrypter.service';
import { EtchedApiService } from '../../../services/etched-api.service';

@Component({
    selector: 'app-journals-container',
    templateUrl: './journals-container.component.html',
    styleUrls: ['./journals-container.component.css']
})
export class JournalsContainerComponent implements OnInit {

    FETCHING = 'FETCHING';
    DECRYPTING = 'DECRYPTING';
    DECRYPTED = 'DECRYPTED';

    journals: JournalEntity[];
    state: string;
    encrypter: Encrypter;

    constructor(private etchedApi: EtchedApiService,
                encrypterService: EncrypterService) {
        this.encrypter = encrypterService.encrypter;
    }

    ngOnInit() {
        this.state = this.FETCHING;
        this.etchedApi.getJournals()
            .subscribe(journals => this.decryptJournals(journals));
    }

    decryptJournals(journals: JournalEntity[]) {
        console.info(`Decrypting journals`);
        this.state = this.DECRYPTING;

        const decrypted: EntryEntity[] = journals.slice(0);
        const decPromises = journals.map(j => this.encrypter.decrypt(j.content));

        Promise.all(decPromises)
            .then((decJournals: Base64Str[]) => {
                console.info(`Decrypted ${decJournals.length} journals`);
                decJournals.forEach((decResult, index) => {
                    decrypted[index].content = decResult;
                });
                this.journals = decrypted;
                this.state = this.DECRYPTED;
            });
    }
}
