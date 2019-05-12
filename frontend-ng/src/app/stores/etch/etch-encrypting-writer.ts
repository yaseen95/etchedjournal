import { Injectable } from '@angular/core';
import { AbstractEtch } from '../../models/etch/abstract-etch';
import { SimpleWriter } from '../../models/writer';
import { EncrypterService } from '../../services/encrypter.service';

@Injectable({ providedIn: 'root' })
export class EtchEncryptingWriter {
    constructor(private encrypter: EncrypterService) {}

    public async write<T extends AbstractEtch>(etches: T[]): Promise<string> {
        // We write many etches as a single blob to save space
        // TODO Should we optimize this now?
        const enc = this.encrypter.encrypter;
        const schema = etches[0].schema;
        const writer = SimpleWriter.getWriter<T[]>(schema);
        const blobified = writer.write(etches);
        return await enc.encrypt(blobified);
    }
}
