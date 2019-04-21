import { OwnerType } from './owner-type';
import { Schema } from './schema';
import { Base64Str } from './types';

/**
 * Representation of an Entry
 */
export interface EntryEntity {
    /** id of this entity */
    id: string;
    /** server timestamp entity was created (as millis since UTC epoch) */
    created: number;
    /** server timestamp entity was last modified (as millis since UTC epoch) */
    modified: number | null;
    /** owner of this entity */
    owner: string;
    /** owner type */
    ownerType: OwnerType;
    /** entity content as a base 64 encoded string */
    content: Base64Str;
    /** schema of entry content */
    schema: Schema;
    /** current version of entity */
    version: number;
    /** id of key pair used to encrypt this entity */
    keyPairId: string;
    /** id of the journal this entry was created in */
    journalId: string;
}
