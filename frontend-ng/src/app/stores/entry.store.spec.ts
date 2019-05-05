import { of } from 'rxjs';
import { EntryV1 } from '../models/entry/entry-v1';
import { SimpleWriter, Writer } from '../models/writer';
import { CreateEntryRequest, EntryService } from '../services/entry.service';
import { FakeEncrypter, FakeEncrypterService } from '../services/fakes.service.spec';
import { EntryEntity } from '../services/models/entry-entity';
import { Schema } from '../services/models/schema';
import { TestUtils } from '../utils/test-utils.spec';
import { EntryStore } from './entry.store';
import createEntryEntity = TestUtils.createEntryEntity;

describe('EntryStore', () => {
    let store: EntryStore;
    let fakeEncrypter: FakeEncrypter;
    let encrypterService: FakeEncrypterService;
    let entryServiceSpy: any;

    beforeEach(() => {
        fakeEncrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = fakeEncrypter;

        entryServiceSpy = jasmine.createSpyObj('EntryService', [
            'createEntry',
            'getEntries',
            'getEntry',
            'updateEntry',
        ]);

        store = new EntryStore(entryServiceSpy, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.entities).toEqual([]);
        expect(store.loading).toBe(false);
    });

    it('getEntries loads and decrypts entries', async () => {
        const entities: Array<Partial<EntryEntity>> = [
            {
                id: 'entryId',
                content: 'foo',
                schema: Schema.V1_0,
            },
        ];
        entryServiceSpy.getEntries.and.returnValue(of(entities));
        fakeEncrypter.setDecryptResponse('{"content":"foo"}');

        await store.getEntries('jid');

        expect(store.entities.length).toEqual(1);
        expect(store.entities[0].id).toEqual('entryId');
        expect(store.entities[0].content).toEqual('{"content":"foo"}');
        expect((store.entriesById.get('entryId') as EntryV1).content).toEqual('foo');

        expect(store.loading).toBe(false);

        expect(entryServiceSpy.getEntries).toHaveBeenCalledTimes(1);
        expect(entryServiceSpy.getEntries).toHaveBeenCalledWith('jid');
    });

    it('getEntry loads and decrypts entry', async () => {
        const encrypted: Partial<EntryEntity> = {
            schema: Schema.V1_0,
            content: 'ciphertext',
            id: 'entryId',
        };
        entryServiceSpy.getEntry.and.returnValue(of(encrypted));
        fakeEncrypter.setDecryptResponse('{"content": "plaintext"}');

        const result = await store.getEntry('entryId');

        expect(entryServiceSpy.getEntry).toHaveBeenCalledTimes(1);
        expect(entryServiceSpy.getEntry).toHaveBeenCalledWith('entryId');

        expect(store.loading).toBeFalsy();
        expect(result.content).toEqual('{"content": "plaintext"}');
        expect(result.id).toEqual('entryId');

        const entry = store.entriesById.get('entryId') as EntryV1;
        expect(entry.content).toEqual('plaintext');
    });

    it('createEntry encrypts and creates entry', async () => {
        const j = { id: '1', content: 'abc' };
        entryServiceSpy.createEntry.and.returnValue(of(j));
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
                schema: Schema.V1_0,
            },
        };
        expect(entryServiceSpy.createEntry).toHaveBeenCalledTimes(1);
        expect(entryServiceSpy.createEntry).toHaveBeenCalledWith(expectedCreateEntryReq);

        expect(writerSpy.write).toHaveBeenCalledTimes(1);
        expect(writerSpy.write).toHaveBeenCalledWith(createEntry('title'));
    });

    it('updateEntry updates entry', async () => {
        const entity = { id: 'entryId', schema: Schema.V1_0, content: 'ciphertext' };
        entryServiceSpy.updateEntry.and.returnValue(of(entity));

        const blob = '{"content":"foobar","schema":"V1_0","created":123}';
        fakeEncrypter.setDecryptResponse(blob);

        await store.updateEntry('entryId', createEntry('foobar'));

        const expectedEntry = createEntry('foobar', 123);
        expect(store.entriesById.get('entryId')).toEqual({ ...expectedEntry });

        const expectedEntity = { ...entity, content: blob };
        expect(store.entities).toEqual([expectedEntity as EntryEntity]);
    });

    it('updateEntry updates entry in place', async () => {
        // Initialize store with an entry
        const oldEntry = createEntry('old content');
        store.entriesById.set('1', oldEntry);
        store.entities = [createEntryEntity({ id: '1' })];

        const entity = { id: '1', schema: Schema.V1_0, content: 'ciphertext' };
        entryServiceSpy.updateEntry.and.returnValue(of(entity));

        const entryBlob = '{"content":"new content","schema":"V1_0","created":123}';
        fakeEncrypter.setDecryptResponse(entryBlob);

        await store.updateEntry('1', createEntry('new content'));

        const expectedEntry = createEntry('new content', 123);
        expect(store.entriesById.get('1')).toEqual({ ...expectedEntry });

        expect(store.entities.length).toEqual(1);
        const expectedEntity = { ...entity, content: entryBlob, };
        expect(store.entities[0]).toEqual(expectedEntity as any);
    });

    function createEntry(content: string, created: number = 1): EntryV1 {
        return new EntryV1({ content, created });
    }
});
