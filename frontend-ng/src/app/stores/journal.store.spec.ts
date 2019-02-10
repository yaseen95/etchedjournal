import { EMPTY, of } from 'rxjs';
import { Encrypter } from '../services/encrypter';
import { EncrypterService } from '../services/encrypter.service';
import { JournalsService } from '../services/journals.service';

import { JournalStore } from './journal.store';

describe('JournalStore', () => {
    let store: JournalStore;
    let encrypterSpy: any;
    let encrypterService: EncrypterService;
    let journalServiceSpy: any;

    beforeEach(() => {
        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt', 'decrypt']);
        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

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
        encrypterSpy.encrypt.and.returnValue(Promise.resolve('ciphertext'));
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
        encrypterService.encrypterObs.next();
        expect(loadJournalsSpy).toHaveBeenCalledTimes(1);
    });
});

export class FakeJournalStore extends JournalStore {
    public encrypterServiceFake: EncrypterService;
    public journalsServiceSpy: JournalsService;
    public encrypterSpy: any;

    constructor() {
        const encSpy = jasmine.createSpyObj('Encrypter', ['encrypt', 'decrypt']);
        const encService = new EncrypterService();
        encService.encrypter = encSpy;
        const journalsService = jasmine.createSpyObj('JournalsService', [
            'getJournals',
            'createJournal',
        ]);

        journalsService.getJournals.and.returnValue(of([]));
        journalsService.createJournal.and.returnValue(EMPTY);

        super(journalsService, encService);

        this.encrypterServiceFake = encService;
        this.journalsServiceSpy = journalsService;
        this.encrypterSpy = encSpy;
    }
}
