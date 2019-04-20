import { Schema } from '../../services/models/schema';

export abstract class AbstractEntry {
    public abstract readonly version: Schema;
}
