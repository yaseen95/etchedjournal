import { Schema } from '../../services/models/schema';

export abstract class AbstractEtch {
    public abstract schemaVersion: string;
}

export class EtchV1 extends AbstractEtch {
    public schemaVersion: Schema = Schema.V1_0;

    /** actual, decrypted content of etch */
    public content: string;

    /** timestamp the etch was created on the user's computer */
    public timestamp: number;

    /** TODO: Enable markdown support */
    public usesMarkdown: boolean = false;

    constructor(content: string, timestamp: number, usesMarkdown: boolean = false) {
        super();
        this.content = content;
        this.timestamp = timestamp;
        this.usesMarkdown = usesMarkdown;
    }
}
