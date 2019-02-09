import { of } from 'rxjs';
import { EtchV1 } from '../models/etch';
import { EtchEntity } from '../models/etch-entity';
import { Encrypter } from '../services/encrypter';
import { EncrypterService } from '../services/encrypter.service';
import { EtchesService } from '../services/etches.service';
import { EtchStore } from './etch.store';

describe('EtchStore', () => {
    let store: EtchStore;
    let encrypterMock: any;
    let encrypterService: EncrypterService;
    let etchServiceMock: any;

    beforeEach(() => {
        encrypterMock = jasmine.createSpyObj('Encrypter', ['encrypt', 'decrypt',
            'decryptEntities']);
        encrypterService = new EncrypterService();
        encrypterService.encrypter = encrypterMock;

        etchServiceMock = jasmine.createSpyObj('EtchesService', ['postEtches',
            'getEtches']);

        store = new EtchStore(etchServiceMock, encrypterService);
    });

    it('variables are uninitialized after construction', () => {
        expect(store.state.etches).toEqual([]);
        expect(store.state.parsedEtches).toEqual([]);
        expect(store.state.loading).toBe(false);
    });

    it('loadEtches loads and decrypts etches', async () => {
        const entries: Partial<EtchEntity>[] = [{id: 'etch id', content: 'ciphertext'}];
        etchServiceMock.getEtches.and.returnValue(of(entries));

        const decryptSpy = encrypterService.encrypter.decryptEntities as any;
        decryptSpy.and.returnValue(Promise.resolve([{
            id: 'etchId',
            content: `[{"schemaVersion": "foo"}]`
        }]));

        await store.loadEtches('entry id');

        expect(store.state.loading).toBe(false);
        expect(store.state.parsedEtches).toEqual([{schemaVersion: 'foo'}] as any);
        expect(encrypterService.encrypter.decryptEntities).toHaveBeenCalledTimes(1);
    });

    it('createEtch encrypts and creates etches', async () => {
        encrypterMock.encrypt.and.returnValue(Promise.resolve('ciphertext'));
        const j = {id: '1', content: 'abc'};
        etchServiceMock.postEtches.and.returnValue(of([{id: '1'}, {id: '2'}]));

        const etches: EtchV1[] = [
            new EtchV1('content', 1),
            new EtchV1('content2', 2),
        ];
        const result = await store.createEtches('entry id', etches);
        expect(result[0].id).toEqual('1');
        expect(result[1].id).toEqual('2');
    });
});

export class FakeEtchStore extends EtchStore {
    public encrypterServiceFake: EncrypterService;
    public etchServiceMock: EtchesService;
    public encrypterMock: any;

    constructor() {
        const encSpy = jasmine.createSpyObj('Encrypter', ['encrypt',
            'decryptEntities']);
        const encService = new EncrypterService();
        encService.encrypter = encSpy;

        const etchService = jasmine.createSpyObj('EtchesService', ['getEtches',
            'postEtches']);
        etchService.getEtches.and.returnValue(of([]));
        etchService.postEtches.and.returnValue(of([]));

        super(etchService, encService);

        this.encrypterServiceFake = encService;
        this.etchServiceMock = etchService;
        this.encrypterMock = encSpy;
    }
}
