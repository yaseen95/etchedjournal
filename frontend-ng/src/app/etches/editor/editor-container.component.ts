import { Component, OnDestroy, OnInit } from '@angular/core';
import { EtchedApiService } from '../../services/etched-api.service';
import { ActivatedRoute } from '@angular/router';
import { EtchQueueService } from '../../services/etch-queue.service';
import { EntryEntity } from '../../models/entry-entity';
import { Encrypter } from '../../services/encrypter';
import { BehaviorSubject } from 'rxjs';
import { AbstractEtch, EtchV1 } from '../../models/etch';
import { EncrypterService } from '../../services/encrypter.service';

const ENTRY_NOT_CREATED = 'NOT_CREATED';
const ENTRY_CREATING = 'ENTRY_CREATING';
const ENTRY_CREATED = 'ENTRY_CREATED';

@Component({
    selector: 'app-editor-container',
    templateUrl: './editor-container.component.html',
    styleUrls: ['./editor-container.component.css'],
})
export class EditorContainerComponent implements OnInit, OnDestroy {
    /** the encryper used to encrypt entries/etches */
    encrypter: Encrypter;

    /** Current title */
    title: string;

    /** the current state of the entry */
    entryCreationState: string;

    journalId: string;

    queuedEtches: AbstractEtch[] = [];

    entrySubject: BehaviorSubject<EntryEntity>;

    constructor(private etchedApi: EtchedApiService,
                private etchQueueService: EtchQueueService,
                private encrypterService: EncrypterService,
                route: ActivatedRoute) {
        this.entrySubject = new BehaviorSubject(null);
        this.journalId = route.snapshot.queryParamMap.get('journalId');
        if (this.journalId === null) {
            console.error('No journal id');
        }
        this.encrypter = encrypterService.encrypter;
    }

    ngOnInit() {
        this.entryCreationState = ENTRY_NOT_CREATED;

        this.entrySubject.subscribe(entry => {
            if (entry !== null) {
                console.info('posting queued etches');
                const copy = this.queuedEtches.slice();
                this.queuedEtches = [];
                copy.forEach(etch => {
                    this.queueEtch(etch);
                });
            }
        });
    }

    ngOnDestroy() {
        this.entrySubject.unsubscribe();
    }

    /**
     * Creates an entry
     */
    private createEntry() {
        console.info('attempting to create entry');
        if (this.entryCreationState !== ENTRY_NOT_CREATED) {
            // The entry has already been created, don't need to do anything here
            console.info('entry has already been created or is creating');
            return;
        }

        console.log(`Creating entry`);
        this.entryCreationState = ENTRY_CREATING;

        this.encrypter.encrypt(this.title)
            .then(ciphertext => {
                console.info(`creating entry with title: ${this.title}`);
                this.etchedApi.createEntry(this.encrypter.keyPairId, this.journalId, ciphertext)
                    .subscribe(entry => {
                        console.log(`Created entry with id ${entry.id}`);
                        this.entryCreationState = ENTRY_CREATED;
                        this.entrySubject.next(entry);
                    });
            });
    }

    onNewEtch(etch: EtchV1) {
        this.queuedEtches.push(etch);

        const entry = this.entrySubject.getValue();
        if (entry === null) {
            this.createEntry();
        } else {
            this.queueEtch(etch);
        }
    }

    private queueEtch(etch: AbstractEtch) {
        const entry = this.entrySubject.getValue();
        this.etchQueueService.put(entry.id, etch);
    }

    onTitleChange(title: string) {
        // TODO: Update the title on the backend once editing is allowed
        console.info(`Next title is ${title}`);
        this.title = title;
    }
}
