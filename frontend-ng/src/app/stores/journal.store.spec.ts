import { of } from 'rxjs';
import { JournalV1 } from '../models/journal/journal-v1';
import { FakeEncrypter, FakeEncrypterService } from '../services/fakes.service.spec';
import { JournalService } from '../services/journal.service';
import { JournalEntity } from '../services/models/journal-entity';
import { Schema } from '../services/models/schema';

import { JournalStore } from './journal.store';

describe('JournalStore', () => {
    let store: JournalStore;
    let fakeEncrypter: FakeEncrypter;
    let encrypterService: FakeEncrypterService;
    let journalServiceSpy: any;

    beforeEach(() => {
        fakeEncrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = fakeEncrypter;

        journalServiceSpy = jasmine.createSpyObj('JournalService', [
            'createJournal',
            'getJournals',
        ]);

        store = new JournalStore(journalServiceSpy, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.entities).toEqual([]);
        expect(store.journals).toEqual([]);
        expect(store.journalsById).toEqual(new Map());
        expect(store.loading).toBe(false);
        expect(store.loadedOnce).toBe(false);
    });

    it('createJournal encrypts and creates journal', async () => {
        const j = { id: '1', content: 'abc' };
        journalServiceSpy.createJournal.and.returnValue(of(j));

        const result = await store.createJournal(new JournalV1({ name: 'name', created: 1_000 }));
        expect(result.id).toEqual('1');
        expect(result.content).toEqual('abc');
    });

    it('loads journals when encrypter is set', () => {
        const loadJournalsSpy = spyOn(store, 'loadJournals');
        encrypterService.encrypterObs.next(null);
        expect(loadJournalsSpy).toHaveBeenCalledTimes(1);
    });

    it('loadJournals loads and reads entities', async () => {
        store.journals = [];
        store.journalsById.clear();
        store.entities = [];

        const journalBlob = '{"name":"journal name","schema":"V1_0","created":123}';
        fakeEncrypter.setDecryptResponse(journalBlob);

        const entity = {
            id: '1',
            schema: Schema.V1_0,
            content: 'ciphertext',
        };
        journalServiceSpy.getJournals.and.returnValue(of([entity]));

        const result = await store.loadJournals();
        expect(result.length).toEqual(1);

        expect(store.entities.length).toEqual(1);
        // the ciphertext should be replaced with the decrypted content
        expect(store.entities[0]).toEqual({ ...entity, content: journalBlob } as JournalEntity);

        expect(store.journals.length).toEqual(1);
        const expectedJournal = new JournalV1({ name: 'journal name', created: 123 });
        expect(store.journals[0]).toEqual(Object.assign({}, expectedJournal));

        expect(store.journalsById.size).toEqual(1);
        expect(store.journalsById.get('1')).toBeDefined();

        const journal = store.journalsById.get('1') as JournalV1;
        expect(journal).toEqual(Object.assign({}, expectedJournal));
    });
});
