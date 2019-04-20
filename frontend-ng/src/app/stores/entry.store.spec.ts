import { of } from 'rxjs';
import { EntryV1 } from '../models/entry/entry-v1';
import { SimpleWriter, Writer } from '../models/writer';
import { EncrypterService } from '../services/encrypter.service';
import { CreateEntryRequest, EntriesService } from '../services/entries.service';
import { FakeEncrypter, FakeEncrypterService } from '../services/fakes.service.spec';
import { EntryEntity } from '../services/models/entry-entity';
import { EntryStore } from './entry.store';

describe('EntryStore', () => {
    let store: EntryStore;
    let fakeEncrypter: FakeEncrypter;
    let encrypterService: FakeEncrypterService;
    let entriesServiceSpy: any;

    beforeEach(() => {
        fakeEncrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = fakeEncrypter;

        entriesServiceSpy = jasmine.createSpyObj('EntriesService', [
            'createEntry',
            'getEntries',
            'getEntry',
        ]);

        store = new EntryStore(entriesServiceSpy, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.entities).toEqual([]);
        expect(store.entries).toEqual([]);
        expect(store.loading).toBe(false);
    });

    it('loadEntries loads and decrypts entries', async () => {
        const entities: Array<Partial<EntryEntity>> = [
            {
                id: 'entryId',
                content: 'foo',
                schema: '1.0.0',
            },
        ];
        entriesServiceSpy.getEntries.and.returnValue(of(entities));
        fakeEncrypter.setDecryptResponse('{"content":"foo"}');

        await store.loadEntries('jid');

        expect(store.entities.length).toEqual(1);
        expect(store.entities[0].id).toEqual('entryId');
        expect(store.entities[0].content).toEqual('{"content":"foo"}');

        const entries = store.entries as EntryV1[];
        expect(entries.length).toEqual(1);
        expect(entries[0].content).toEqual('foo');
        expect((store.entriesById.get('entryId') as EntryV1).content).toEqual('foo');

        expect(store.loading).toBe(false);

        expect(entriesServiceSpy.getEntries).toHaveBeenCalledTimes(1);
        expect(entriesServiceSpy.getEntries).toHaveBeenCalledWith('jid');
    });

    it('loadEntry loads and decrypts entry', async () => {
        const encrypted: Partial<EntryEntity> = {
            schema: '1.0.0',
            content: 'ciphertext',
            id: 'entryId',
        };
        entriesServiceSpy.getEntry.and.returnValue(of(encrypted));
        fakeEncrypter.setDecryptResponse('{"content": "plaintext"}');

        const result = await store.loadEntry('entryId');

        expect(entriesServiceSpy.getEntry).toHaveBeenCalledTimes(1);
        expect(entriesServiceSpy.getEntry).toHaveBeenCalledWith('entryId');

        expect(store.loading).toBeFalsy();
        expect(result.content).toEqual('{"content": "plaintext"}');
        expect(result.id).toEqual('entryId');

        const entry = store.entriesById.get('entryId') as EntryV1;
        expect(entry.content).toEqual('plaintext');
    });

    it('createEntry encrypts and creates entry', async () => {
        const j = { id: '1', content: 'abc' };
        entriesServiceSpy.createEntry.and.returnValue(of(j));
        fakeEncrypter.setEncryptResponse('ciphertext');

        const writerSpy = jasmine.createSpyObj('Writer', ['write']);
        const getWriterSpy = spyOn(SimpleWriter, 'getWriter');
        getWriterSpy.and.returnValue(writerSpy);

        const result = await store.createEntry('jid', createEntry('title'));
        expect(result.id).toEqual('1');
        expect(result.content).toEqual('abc');

        const expectedCreateEntryReq: CreateEntryRequest = {
            journalId: 'jid',
            entry: {
                content: 'ciphertext',
                keyPairId: 'fakeKeyPairId',
                schema: '1.0.0',
            }
        };
        expect(entriesServiceSpy.createEntry).toHaveBeenCalledTimes(1);
        expect(entriesServiceSpy.createEntry).toHaveBeenCalledWith(expectedCreateEntryReq);

        expect(writerSpy.write).toHaveBeenCalledTimes(1);
        expect(writerSpy.write).toHaveBeenCalledWith(createEntry('title'));
    });

    function createEntry(content: string): EntryV1 {
        return new EntryV1({ content, timestamp: 1 });
    }
});
