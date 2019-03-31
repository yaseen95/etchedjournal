import { of } from 'rxjs';
import { EncrypterService } from '../services/encrypter.service';
import { FakeEncrypter, FakeEncrypterService } from '../services/fakes.service.spec';
import { JournalsService } from '../services/journals.service';

import { JournalStore } from './journal.store';

describe('JournalStore', () => {
    let store: JournalStore;
    let encrypterService: EncrypterService;
    let journalServiceSpy: any;

    beforeEach(() => {
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = new FakeEncrypter();

        journalServiceSpy = jasmine.createSpyObj('JournalsService', [
            'createJournal',
            'getJournals',
        ]);

        store = new JournalStore(journalServiceSpy, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.journals).toEqual([]);
        expect(store.loading).toBe(false);
        expect(store.loadedOnce).toBe(false);
    });

    it('createJournal encrypts and creates journal', async () => {
        const j = { id: '1', content: 'abc' };
        journalServiceSpy.createJournal.and.returnValue(of(j));
        const loadJournalsSpy = spyOn(store, 'loadJournals');

        const result = await store.createJournal('name');
        expect(result.id).toEqual('1');
        expect(result.content).toEqual('abc');

        // Should call load journals after creating journal
        expect(loadJournalsSpy).toHaveBeenCalledTimes(1);
    });

    it('loads journals when encrypter is set', () => {
        const loadJournalsSpy = spyOn(store, 'loadJournals');
        encrypterService.encrypterObs.next(null);
        expect(loadJournalsSpy).toHaveBeenCalledTimes(1);
    });
});
