import { Schema } from '../../services/models/schema';
import { AbstractEntry } from './abstract-entry';

export class EntryV1 extends AbstractEntry {
    public readonly schema: Schema = Schema.V1_0;

    /** actual decrypted content */
    public readonly content: string;

    /** timestamp the entry was created on the user's computer */
    public readonly created: number;

    constructor(entry: { content: string; created: number }) {
        super();
        this.content = entry.content;
        this.created = entry.created;
    }
}
