import { OwnerType } from './owner-type';

export type Uuid = string
export type Base64Str = string

export interface EncryptedEntity {
    /** id of this entity */
    id: Uuid,

    /** server timestamp represented as millis since UTC epoch */
    timestamp: number,

    /** entity content as a base 64 encoded string */
    content: Base64Str,

    /** owner of this entity */
    // TODO: Is owner the right name?
    owner: string,

    /** owner type */
    ownerType: OwnerType
}
