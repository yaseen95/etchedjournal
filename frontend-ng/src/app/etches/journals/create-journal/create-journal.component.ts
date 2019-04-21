import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EtchedRoutes } from '../../../app-routing-utils';
import { JournalV1 } from '../../../models/journal/journal-v1';
import { ClockService } from '../../../services/clock.service';
import { JournalStore } from '../../../stores/journal.store';
import { JOURNAL_NAME_VALIDATORS, JournalFormUtils } from '../../../user/form-utils';

@Component({
    selector: 'app-create-journal',
    templateUrl: './create-journal.component.html',
    styleUrls: ['./create-journal.component.css'],
})
export class CreateJournalComponent {
    public createJournalForm: FormGroup;
    public submitClicked: boolean;
    public creatingJournal: boolean;

    public JOURNAL_NAME_MAX_LENGTH = JournalFormUtils.JOURNAL_NAME_MAX_LENGTH;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private journalStore: JournalStore,
        private clock: ClockService
    ) {
        this.submitClicked = false;
        this.creatingJournal = false;
        this.createJournalForm = this.fb.group({
            journalName: ['', JOURNAL_NAME_VALIDATORS],
        });
    }

    public onSubmit() {
        this.submitClicked = true;
        if (this.createJournalForm.valid) {
            const name: string = this.createJournalForm.controls.journalName.value.trim();
            this.createJournal(name);
        }
    }

    public async createJournal(name: string) {
        this.creatingJournal = true;
        const journal = new JournalV1({ name: name, created: this.clock.nowMillis() });
        const created = await this.journalStore.createJournal(journal);
        this.creatingJournal = false;
        const navExtras = { queryParams: { journalId: created.id } };
        this.router.navigate([`${EtchedRoutes.ENTRIES_CREATE_PATH}`], navExtras);
    }
}
