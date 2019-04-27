import { of } from 'rxjs';
import { EtchV1 } from '../models/etch/etch';
import { EtchService } from '../services/etch.service';
import { FakeEncrypter, FakeEncrypterService } from '../services/fakes.service.spec';
import { EtchEntity } from '../services/models/etch-entity';
import { EtchStore } from './etch.store';

describe('EtchStore', () => {
    let store: EtchStore;
    let encrypterService: FakeEncrypterService;
    let fakeEncrypter: FakeEncrypter;
    let etchServiceMock: any;

    beforeEach(() => {
        fakeEncrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = fakeEncrypter;

        etchServiceMock = jasmine.createSpyObj('EtchService', ['postEtches', 'getEtches']);

        store = new EtchStore(etchServiceMock, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.state.etches).toEqual([]);
        expect(store.state.parsedEtches).toEqual([]);
        expect(store.state.loading).toBe(false);
    });

    it('loadEtches loads and decrypts etches', async () => {
        const entries: Array<Partial<EtchEntity>> = [{ id: 'etch id', content: 'ciphertext' }];
        etchServiceMock.getEtches.and.returnValue(of(entries));
        fakeEncrypter.setDecryptResponse('[{"schemaVersion": "foo"}]');

        await store.loadEtches('entry id');

        expect(store.state.loading).toBe(false);
        expect(store.state.parsedEtches).toEqual([{ schemaVersion: 'foo' }] as any);

        expect(etchServiceMock.getEtches).toHaveBeenCalledTimes(1);
        expect(etchServiceMock.getEtches).toHaveBeenCalledWith('entry id');
    });

    it('createEtch encrypts and creates etches', async () => {
        etchServiceMock.postEtches.and.returnValue(of([{ id: '1' }, { id: '2' }]));

        const etches: EtchV1[] = [new EtchV1('content', 1), new EtchV1('content2', 2)];
        const result = await store.createEtches('entry id', etches);
        expect(result[0].id).toEqual('1');
        expect(result[1].id).toEqual('2');
    });
});
