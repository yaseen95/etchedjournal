import { Schema } from '../../services/models/schema';

export abstract class AbstractJournal {
    public abstract readonly schema: Schema;
}
