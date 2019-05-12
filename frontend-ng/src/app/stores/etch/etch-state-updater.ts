import { AbstractEtch } from '../../models/etch/abstract-etch';
import { EtchEntity } from '../../services/models/etch-entity';
import { MultiMap } from '../../utils/multi-map';
import { isEqual } from '../../utils/object-utils';
import { EtchesAndEntity } from './etch.store';

// Using an interface instead of EtchStore to minimize the API surface
export interface State {
    entities: EtchEntity[];
    etchesById: Map<string, AbstractEtch[]>;
    etchesByEntry: MultiMap<string, AbstractEtch>;
}

export class EtchStateUpdater {
    public static update(state: State, updates: EtchesAndEntity[]) {
        // Map entryId -> etches
        const entryUpdates = new MultiMap<string, EtchesAndEntity>();
        updates.forEach(u => {
            this.updateEntityState(state, u);
            entryUpdates.set(u.entity.entryId, u);
        });

        for (const id of entryUpdates.keys()) {
            this.updateLocalState(state, id, entryUpdates.get(id));
        }
    }

    private static updateEntityState(store: State, update: EtchesAndEntity) {
        const entity = update.entity;
        const updateIndex = store.entities.findIndex(e => e.id === entity.id);
        if (updateIndex >= 0) {
            store.entities[updateIndex] = entity;
        } else {
            store.entities.push(entity);
        }
        store.etchesById.set(entity.id, update.etches);
    }

    private static updateLocalState(
        store: State,
        entryId: string,
        updates: EtchesAndEntity[]
    ) {
        const flattened = [];
        for (const update of updates) {
            flattened.push(...update.etches);
        }

        for (const etch of flattened) {
            // We check if an etch exists by comparing values.
            // This means that if a user created 2 etches with the same content and timestamp
            // we'd only recognize one. Highly unlikely to occur given that people would have to
            // type the same thing very quickly in order to avoid the timestamp checks. But it's
            // worth noting regardless.
            const entryEtches = store.etchesByEntry.get(entryId);
            const idx = entryEtches.findIndex(e => isEqual(e, etch));
            if (idx === -1) {
                // UI does not know about this etch yet, update it
                store.etchesByEntry.set(entryId, etch);
            }
        }
    }
}
