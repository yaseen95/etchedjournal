import { Schema } from '../../services/models/schema';
import { AbstractEtch } from './abstract-etch';

export class EtchV1 extends AbstractEtch {
    public readonly schema: Schema = Schema.V1_0;

    /** actual, decrypted content of etch */
    public readonly content: string;

    /** timestamp the etch was created on the user's computer */
    public readonly created: number;

    constructor(etch: { content: string, created: number }) {
        super();
        this.content = etch.content;
        this.created = etch.created;
    }
}
