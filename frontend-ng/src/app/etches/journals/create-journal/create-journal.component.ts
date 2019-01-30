import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';
import { JournalEntity } from '../../../models/journal-entity';
import { JournalStore } from '../../../stores/journal.store';
import { JOURNAL_NAME_VALIDATORS, JournalFormUtils } from '../../../user/form-utils';

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
                private router: Router,
                private journalStore: JournalStore) {
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
        }
    }

    createJournal() {
        this.creatingJournal = true;
        const journalName = this.createJournalForm.controls.journalName.value.trim();
        console.info('Encrypting journal title');
        this.journalStore.createJournal(journalName)
            .then((j: JournalEntity) => {
                this.creatingJournal = false;
                const navExtras = {queryParams: {journalId: j.id}};
                this.router.navigate([`${EtchedRoutes.ENTRIES_CREATE_PATH}`], navExtras);
            });
    }
}
