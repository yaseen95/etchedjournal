import { EncryptedEntity } from './encrypted-entity';

/**
 * Representation of an Etch (on the backend)
 */
export interface EtchEntity extends EncryptedEntity {
    entryId: string;
}
