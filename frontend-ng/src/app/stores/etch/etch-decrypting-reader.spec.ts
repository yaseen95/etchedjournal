import { FakeEncrypter, FakeEncrypterService } from '../../services/fakes.service.spec';
import { TestUtils } from '../../utils/test-utils.spec';
import { EtchesAndEntity } from './etch.store';
import { EtchDecryptingReader } from './etch-decrypting-reader';
import createEtch = TestUtils.createEtch;
import createEtchEntity = TestUtils.createEtchEntity;

describe('EtchDecryptingReader', () => {

    let encrypterService: FakeEncrypterService;
    let encrypter: FakeEncrypter;

    beforeEach(() => {
        encrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = encrypter;
    });

    it('reads and decrypts etches', async () => {
        const reader = new EtchDecryptingReader(encrypterService);
        const dump = `[
            {"content": "etch1", "created": 123, "schema": "V1_0"},
            {"content": "etch2", "created": 500, "schema": "V1_0"}
        ]`;
        encrypter.setDecryptResponse(dump);

        const entities = [createEtchEntity({ content: 'ciphertext', id: 'etchId' })];
        const read: EtchesAndEntity[] = await reader.read(entities);
        expect(read.length).toEqual(1);

        const { entity, etches } = read[0];

        // Should replace the ciphertext with the decrypted content
        expect(entity.content).toEqual(dump);
        expect(entity.id).toEqual('etchId');

        expect(etches.length).toEqual(2);
        expect(etches[0]).toEqual(createEtch('etch1', 123));
        expect(etches[1]).toEqual(createEtch('etch2', 500));
    });
});
