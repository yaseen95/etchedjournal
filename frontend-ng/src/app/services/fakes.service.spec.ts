import { EMPTY, of } from 'rxjs';
import { EntryStore } from '../stores/entry.store';
import { EtchDecryptingReader } from '../stores/etch/etch-decrypting-reader';
import { EtchEncryptingWriter } from '../stores/etch/etch-encrypting-writer';
import { EtchQueue } from '../stores/etch/etch-queue';
import { EtchStore } from '../stores/etch/etch.store';
import { JournalStore } from '../stores/journal.store';
import { ObjectUtils } from '../utils/object-utils';
import { Encrypter } from './encrypter';
import { EncrypterService } from './encrypter.service';
import { EntryService } from './entry.service';
import { EtchService } from './etch.service';
import { JournalService } from './journal.service';
import { Base64Str } from './models/types';
import { SecureStorageService } from './secure-storage.service';

export class FakeEncrypter extends Encrypter {
    private encryptResponse: string = 'ciphertext';
    private decryptResponse: string = 'plaintext';

    public constructor() {
        super(null, null, null, 'fakeKeyPairId');
    }

    public async encrypt(message: string): Promise<Base64Str> {
        return Promise.resolve(this.encryptResponse);
    }

    public async decrypt(encoded: Base64Str): Promise<string> {
        return Promise.resolve(this.decryptResponse);
    }

    public setDecryptResponse(decryptResponse: string) {
        this.decryptResponse = decryptResponse;
    }

    public setEncryptResponse(encryptResponse: string) {
        this.encryptResponse = encryptResponse;
    }
}

export class FakeEncrypterService extends EncrypterService {
    private encrypterHolder: Encrypter;

    constructor() {
        localStorage.clear();
        super(localStorage as SecureStorageService);
    }

    public set encrypter(e: Encrypter) {
        if (ObjectUtils.isNotDefined(e)) {
            throw new Error('Encrypter cannot be null');
        }
        this.encrypterHolder = e;
        this.encrypterObs.next(e);
    }

    public get encrypter(): Encrypter | null {
        return this.encrypterHolder;
    }
}

export class FakeJournalStore extends JournalStore {
    public encrypterServiceFake: FakeEncrypterService;
    public journalServiceSpy: JournalService;

    constructor() {
        const encrypter = new FakeEncrypter();
        const encService = new FakeEncrypterService();
        encService.encrypter = encrypter;

        const journalService = jasmine.createSpyObj('JournalService', [
            'getJournals',
            'createJournal',
        ]);

        journalService.getJournals.and.returnValue(of([]));
        journalService.createJournal.and.returnValue(EMPTY);

        super(journalService, encService);

        this.encrypterServiceFake = encService;
        this.journalServiceSpy = journalService;
    }
}

export class FakeEntryStore extends EntryStore {
    public encrypterServiceFake: FakeEncrypterService;
    public entryServiceSpy: EntryService;

    constructor() {
        const encService = new FakeEncrypterService();
        encService.encrypter = new FakeEncrypter();

        const entryService = jasmine.createSpyObj('EntryService', [
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
    }
}

export class FakeEtchQueue extends EtchQueue {
    constructor() {
        super();
        this.subscription.unsubscribe();
    }
}

export class FakeEtchStore extends EtchStore {
    public encrypterServiceFake: EncrypterService;
    public etchServiceMock: EtchService;

    constructor() {
        const encService = new FakeEncrypterService();
        encService.encrypter = new FakeEncrypter();

        const etchService = jasmine.createSpyObj('EtchService', ['getEtches', 'postEtches']);
        etchService.getEtches.and.returnValue(of([]));
        etchService.postEtches.and.returnValue(of([]));

        super(
            etchService,
            encService,
            new FakeEtchQueue(),
            new EtchDecryptingReader(encService),
            new EtchEncryptingWriter(encService)
        );

        this.encrypterServiceFake = encService;
        this.etchServiceMock = etchService;
    }
}
