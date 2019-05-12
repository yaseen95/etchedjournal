import { of } from 'rxjs';
import { EtchV1 } from '../../models/etch/etch-v1';
import { EncrypterService } from '../../services/encrypter.service';
import { EtchService } from '../../services/etch.service';
import {
    FakeEncrypter,
    FakeEncrypterService,
    FakeEtchQueue
} from '../../services/fakes.service.spec';
import { EtchEntity } from '../../services/models/etch-entity';
import { Schema } from '../../services/models/schema';
import { MultiMap } from '../../utils/multi-map';
import { TestUtils } from '../../utils/test-utils.spec';
import { EtchDecryptingReader } from './etch-decrypting-reader';
import { EtchEncryptingWriter } from './etch-encrypting-writer';
import { EtchQueue } from './etch-queue';
import { EtchesAndEntity, EtchStore } from './etch.store';
import createEtch = TestUtils.createEtch;
import createEtchEntity = TestUtils.createEtchEntity;
import getIfDefinedOrDefault = TestUtils.getIfDefinedOrDefault;

describe('EtchStore', () => {
    let store: EtchStore;
    let encrypterService: FakeEncrypterService;
    let encrypter: FakeEncrypter;
    let queue: FakeEtchQueue;
    let reader: EtchDecryptingReader;
    let writer: EtchEncryptingWriter;
    let etchService: EtchService | any;

    const ETCH_FOO = createEtch('foo');

    beforeEach(() => {
        encrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = encrypter;

        reader = new EtchDecryptingReader(encrypterService);
        writer = new EtchEncryptingWriter(encrypterService);
        queue = new FakeEtchQueue();

        etchService = jasmine.createSpyObj('EtchService', ['postEtches', 'getEtches']);

        store = createStore({});
    });

    it('variables are uninitialized after construction', () => {
        expect(store.entities).toEqual([]);
        expect(store.etchesById.size).toEqual(0);
        expect(store.loading).toBe(false);
    });

    it('getEtches loads and decrypts etches', async () => {
        const etches: Array<Partial<EtchEntity>> = [{
            id: 'etchId',
            content: 'ciphertext',
            schema: Schema.V1_0
        }];
        etchService.getEtches.and.returnValue(of(etches));
        encrypter.setDecryptResponse('[{"schema": "V1_0","content":"foo","created":123}]');

        await store.getEtches('entryId');

        expect(store.loading).toBe(false);
        const expectedEtches = [createEtch('foo', 123)];
        expect(store.etchesById.get('etchId')).toEqual(expectedEtches);

        expect(etchService.getEtches).toHaveBeenCalledTimes(1);
        expect(etchService.getEtches).toHaveBeenCalledWith('entryId');
    });

    it('createEtch encrypts and creates etches', async () => {
        const writeSpy = spyOn(writer, 'write');
        writeSpy.and.returnValue('ciphertext');

        etchService.postEtches.and.returnValue(of([createEtchEntity({ id: '1', entryId: '9' })]));

        const etches: EtchV1[] = [ETCH_FOO, createEtch('bar', 1)];
        const retVal: EtchesAndEntity[] = [
            { entity: createEtchEntity({ id: '1', entryId: '9' }), etches },
        ];
        const readSpy = spyOn(reader, 'read');
        readSpy.and.returnValue(Promise.resolve(retVal));

        const result = await store.createEtches('entry id', etches);

        expect(result.length).toEqual(1);
        expect(result[0].id).toEqual('1');
        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(writeSpy).toHaveBeenCalledWith(etches);
        expect(readSpy).toHaveBeenCalledTimes(1);
        expect(readSpy).toHaveBeenCalledWith([createEtchEntity({ id: '1', entryId: '9' })]);
        expect(store.etchesByEntry.get('9')).toEqual(etches);
        expect(store.etchesById.get('1')).toEqual(etches);
    });

    it('addEtches adds etches to queue', () => {
        const queuePutSpy = spyOn(queue, 'put');
        const etches = [ETCH_FOO];
        store.addEtches('entryId', etches);

        expect(queuePutSpy).toHaveBeenCalledWith('entryId', etches);
        expect(queuePutSpy).toHaveBeenCalledTimes(1);
    });

    it('addEtches adds etches removes duplicates', () => {
        const queuePutSpy = spyOn(queue, 'put');
        const etches = [createEtch('foo'), createEtch('foo')];
        store.addEtches('entryId', etches);

        expect(queuePutSpy).toHaveBeenCalledWith('entryId', [ETCH_FOO]);
        expect(queuePutSpy).toHaveBeenCalledTimes(1);
        expect(store.etchesByEntry.size).toEqual(1);
        expect(store.etchesByEntry.get('entryId')).toEqual([ETCH_FOO]);
    });

    it('listens to queue and creates etches', () => {
        const createEtchesSpy = spyOn(store, 'createEtches');

        const nextBatch = MultiMap.of('entry1', [ETCH_FOO]);
        nextBatch.set('entry2', createEtch('bar'));
        queue.queueObs.next(nextBatch);

        expect(createEtchesSpy).toHaveBeenCalledTimes(2);
        expect(createEtchesSpy.calls.allArgs()).toEqual([
            ['entry1', [ETCH_FOO]],
            ['entry2', [createEtch('bar')]]
        ]);
    });

    function createStore(deps: {
        encrypterService?: EncrypterService,
        queue?: EtchQueue,
        reader?: EtchDecryptingReader,
        writer?: EtchEncryptingWriter,
        etchService?: EtchService
    }): EtchStore {
        return new EtchStore(
            getIfDefinedOrDefault(deps.etchService, etchService),
            getIfDefinedOrDefault(deps.encrypterService, encrypterService),
            getIfDefinedOrDefault(deps.queue, queue),
            getIfDefinedOrDefault(deps.reader, reader),
            getIfDefinedOrDefault(deps.writer, writer),
        );
    }
});
