import { EMPTY, of } from 'rxjs';
import { EntryEntity } from '../models/entry-entity';
import { Encrypter } from '../services/encrypter';
import { EncrypterService } from '../services/encrypter.service';
import { EntriesService } from '../services/entries.service';
import { JournalsService } from '../services/journals.service';
import { EntryStore } from './entry.store';
import { JournalStore } from './journal.store';

describe('EntryStore', () => {
    let store: EntryStore;
    let encrypterSpy: any;
    let encrypterService: EncrypterService;
    let entriesServiceSpy: any;

    beforeEach(() => {
        encrypterSpy = jasmine.createSpyObj('Encrypter', ['encrypt', 'decrypt', 'decryptEntities']);
        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterSpy;

        entriesServiceSpy = jasmine.createSpyObj('EntriesService', ['createEntry', 'getEntries']);

        store = new EntryStore(entriesServiceSpy, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.entries).toEqual([]);
        expect(store.loading).toBe(false);
    });

    it('loadEntries loads and decrypts entries', async () => {
        const entries: Array<Partial<EntryEntity>> = [{ id: 'entryId', content: 'foo' }];
        entriesServiceSpy.getEntries.and.returnValue(of(entries));

        const decryptSpy = encrypterService.encrypter.decryptEntities as any;
        decryptSpy.and.returnValue(Promise.resolve(entries));

        await store.loadEntries('jid');

        expect(entries.length).toEqual(1);
        expect(entries[0].id).toEqual('entryId');
        expect(entries[0].content).toEqual('foo');
        expect(store.loading).toBe(false);
        expect(encrypterService.encrypter.decryptEntities).toHaveBeenCalledTimes(1);
    });

    it('createEntry encrypts and creates journal', async () => {
        encrypterSpy.encrypt.and.returnValue(Promise.resolve('ciphertext'));
        const j = { id: '1', content: 'abc' };
        entriesServiceSpy.createEntry.and.returnValue(of(j));

        const result = await store.createEntry('jid', 'name');
        expect(result.id).toEqual('1');
        expect(result.content).toEqual('abc');
    });
});

export class FakeEntryStore extends EntryStore {
    public encrypterServiceFake: EncrypterService;
    public entryServiceSpy: EntriesService;
    public encrypterSpy: any;

    constructor() {
        const encSpy = jasmine.createSpyObj('Encrypter', ['encrypt', 'decryptEntities']);
        const encService = new EncrypterService();
        encService.encrypter = encSpy;
        const entryService = jasmine.createSpyObj('EntriesService', [
            'getEntries',
            'createEntry',
            'getEntry',
        ]);

        entryService.getEntries.and.returnValue(of([]));
        entryService.createEntry.and.returnValue(EMPTY);
        entryService.getEntry.and.returnValue(EMPTY);

        super(entryService, encService);

        this.encrypterServiceFake = encService;
        this.entryServiceSpy = entryService;
        this.encrypterSpy = encSpy;
    }
}
