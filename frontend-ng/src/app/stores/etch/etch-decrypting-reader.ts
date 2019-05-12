import { Injectable } from '@angular/core';
import { EtchV1Reader } from '../../models/etch/etch-v1-reader';
import { EncrypterService } from '../../services/encrypter.service';
import { EtchEntity } from '../../services/models/etch-entity';
import { removeDuplicates } from '../../utils/object-utils';
import { EtchesAndEntity } from './etch.store';

@Injectable({ providedIn: 'root' })
export class EtchDecryptingReader {
    constructor(private encrypter: EncrypterService) {}

    public async read(encrypted: EtchEntity[]): Promise<EtchesAndEntity[]> {
        const etches: EtchesAndEntity[] = [];
        for (const e of encrypted) {
            const result = await this.decryptAndRead(e);
            etches.push(result);
        }
        return etches;
    }

    private async decryptAndRead(entity: EtchEntity): Promise<EtchesAndEntity> {
        const encrypter = this.encrypter.encrypter;
        const decrypted = await encrypter.decryptEntity(entity);
        const reader = EtchV1Reader.getReader(entity.schema);
        const etches = reader.read(JSON.parse(decrypted.content));
        const uniqueEtches = removeDuplicates(etches);
        return { entity: decrypted, etches: uniqueEtches };
    }
}
