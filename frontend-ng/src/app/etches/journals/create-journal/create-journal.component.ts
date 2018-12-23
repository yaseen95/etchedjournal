import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { JOURNAL_NAME_VALIDATORS, JournalFormUtils } from '../../../user/form-utils';
import { EtchedApiService } from '../../../services/etched-api.service';
import { EncrypterService } from '../../../services/encrypter.service';
import { Base64Str } from '../../../models/encrypted-entity';
import { Observable } from 'rxjs';
import { JournalEntity } from '../../../models/journal-entity';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';

@Component({
    selector: 'app-create-journal',
    templateUrl: './create-journal.component.html',
    styleUrls: ['./create-journal.component.css']
})
export class CreateJournalComponent implements OnInit {

    createJournalForm: FormGroup;
    submitClicked: boolean;
    creatingJournal: boolean;

    JOURNAL_NAME_MAX_LENGTH = JournalFormUtils.JOURNAL_NAME_MAX_LENGTH;

    constructor(private fb: FormBuilder,
                private etchedApi: EtchedApiService,
                private encrypterService: EncrypterService,
                private router: Router) {
        this.submitClicked = false;
        this.creatingJournal = false;
        this.createJournalForm = this.fb.group({
            journalName: ['', JOURNAL_NAME_VALIDATORS],
        });
    }

    ngOnInit() {
    }

    onSubmit() {
        this.submitClicked = true;
        if (this.createJournalForm.valid) {
            this.createJournal();
            this.creatingJournal = true;
        }
    }

    createJournal() {
        const journalName = this.createJournalForm.controls.journalName.value.trim();
        console.info('Encrypting journal title');
        this.encrypterService.encrypter.encrypt(journalName)
            .then((ciphertext: Base64Str) => {
                console.info('Finished encrypting journal title');
                return this.etchedApi.createJournal(ciphertext);
            })
            .then((savedJournalObs: Observable<JournalEntity>) => {
                savedJournalObs.subscribe(journal => {
                    console.info(`Created journal`);
                    this.creatingJournal = false;
                    const navExtras = {queryParams: {journalId: journal.id}};
                    this.router.navigate([`${EtchedRoutes.ENTRIES_CREATE_PATH}`], navExtras);
                });
            });
    }
}
