import { AbstractEntry } from './abstract-entry';

export class EntryV1 extends AbstractEntry {
    public readonly version: string = '1.0.0';

    /** actual decrypted content */
    public readonly content: string;

    /** timestamp the entry was created on the user's computer */
    public readonly timestamp: number;

    public readonly usesMarkdown: boolean = false;

    constructor(entry: { content: string; timestamp: number; usesMarkdown?: boolean }) {
        super();
        this.content = entry.content;
        this.timestamp = entry.timestamp;
        if (entry.usesMarkdown !== undefined) {
            this.usesMarkdown = entry.usesMarkdown;
        }
    }
}
