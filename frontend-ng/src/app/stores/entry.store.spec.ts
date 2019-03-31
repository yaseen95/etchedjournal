import { of } from 'rxjs';
import { EntryEntity } from '../models/entry-entity';
import { EncrypterService } from '../services/encrypter.service';
import { EntriesService } from '../services/entries.service';
import { FakeEncrypter, FakeEncrypterService } from '../services/fakes.service.spec';
import { EntryStore } from './entry.store';

describe('EntryStore', () => {
    let store: EntryStore;
    let encrypterService: EncrypterService;
    let entriesServiceSpy: any;

    beforeEach(() => {
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = new FakeEncrypter();

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

        await store.loadEntries('jid');

        expect(store.entries.length).toEqual(1);
        expect(store.entries[0].id).toEqual('entryId');
        expect(store.entries[0].content).toEqual('plaintext');
        expect(store.loading).toBe(false);

        expect(entriesServiceSpy.getEntries).toHaveBeenCalledTimes(1);
        expect(entriesServiceSpy.getEntries).toHaveBeenCalledWith('jid');
    });

    it('createEntry encrypts and creates journal', async () => {
        const j = { id: '1', content: 'abc' };
        entriesServiceSpy.createEntry.and.returnValue(of(j));

        const result = await store.createEntry('jid', 'name');
        expect(result.id).toEqual('1');
        expect(result.content).toEqual('abc');
    });
});
