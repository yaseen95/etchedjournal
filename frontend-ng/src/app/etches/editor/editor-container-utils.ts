import { EntryV1 } from '../../models/entry/entry-v1';
import { Schema } from '../../services/models/schema';
import { EntryStore } from '../../stores/entry.store';

export const maybeUpdateTitle = (entryStore: EntryStore, entityId: string, title: string) => {
    const entry = entryStore.entriesById.get(entityId);
    const trimmed = title.trim();

    switch (entry.schema) {
        case Schema.V1_0:
            const entryV1 = entry as EntryV1;
            if (trimmed !== entryV1.content.trim()) {
                console.info('Renaming entry');
                const newEntry: EntryV1 = { ...entryV1, content: title };
                entryStore.updateEntry(entityId, newEntry);
            }
            break;
        default:
            throw new Error(`Unexpected schema ${entry.schema}`);
    }
};
