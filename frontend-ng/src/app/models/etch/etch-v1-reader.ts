import { Schema } from '../../services/models/schema';
import { Reader } from '../reader';
import { EtchV1 } from './etch-v1';

export class EtchV1Reader implements Reader<EtchV1[]> {
    public static getReader<T>(schema: Schema): EtchV1Reader {
        switch (schema) {
            case Schema.V1_0:
                return new EtchV1Reader();
            default:
                throw new Error(`Unsupported version: ${schema}`);
        }
    }

    public read(data: any | any[]): EtchV1[] {
        if (!Array.isArray(data)) {
            throw new Error(`Expected data to be an array but got ${data}`);
        }
        return data.map(d => new EtchV1(d));
    }
}
