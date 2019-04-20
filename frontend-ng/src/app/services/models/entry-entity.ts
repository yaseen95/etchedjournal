import { EncryptedEntity } from './encrypted-entity';

/**
 * Representation of an Entry
 */
export interface EntryEntity extends EncryptedEntity {
    journalId: string;
}
