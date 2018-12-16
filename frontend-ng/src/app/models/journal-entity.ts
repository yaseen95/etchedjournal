import { EncryptedEntity } from './encrypted-entity';

/**
 * Representation of a Journal
 */
export interface JournalEntity extends EncryptedEntity {
    /** Specifies whether journal is the default journal */
    readonly default: boolean;
}
