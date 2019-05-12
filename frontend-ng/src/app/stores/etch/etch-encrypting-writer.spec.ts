import { FakeEncrypter, FakeEncrypterService } from '../../services/fakes.service.spec';
import { TestUtils } from '../../utils/test-utils.spec';
import { EtchEncryptingWriter } from './etch-encrypting-writer';
import createEtch = TestUtils.createEtch;

describe('EtchEncryptingWriter', () => {
    let encrypterService: FakeEncrypterService;
    let encrypter: FakeEncrypter;

    beforeEach(() => {
        encrypter = new FakeEncrypter();
        encrypterService = new FakeEncrypterService();
        encrypterService.encrypter = encrypter;
    });

    it('encrypts and writes', async () => {
        const writer = new EtchEncryptingWriter(encrypterService);
        const etches = [createEtch('etch1', 123), createEtch('etch2', 500)];
        const encryptSpy = spyOn(encrypter, 'encrypt');
        encryptSpy.and.returnValue(Promise.resolve('ciphertext'));

        const result = await writer.write(etches);
        expect(result).toEqual('ciphertext');

        expect(encryptSpy).toHaveBeenCalledTimes(1);
        expect(encryptSpy).toHaveBeenCalledWith(JSON.stringify(etches));
    });
});
