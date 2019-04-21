import { Schema } from '../../services/models/schema';
import { AbstractJournal } from './abstract-journal';

export class JournalV1 extends AbstractJournal {
    public readonly schema: Schema = Schema.V1_0;
    public readonly name: string;
    /** timestamp the journal was created on the user's computer */
    public readonly created: number;

    constructor(entry: { name: string; created: number; }) {
        super();
        this.name = entry.name;
        this.created = entry.created;
    }
}
