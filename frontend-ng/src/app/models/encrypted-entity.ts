import { BaseEntity } from './base-entity';

export type Base64Str = string

export interface EncryptedEntity extends BaseEntity {
    /** entity content as a base 64 encoded string */
    content: Base64Str,
}
