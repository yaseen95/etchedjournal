import { OwnerType } from './owner-type';
import { Base64Str, Uuid } from './encrypted-entity';

export interface KeyPairEntity {
    /** id of this entity */
    id: Uuid,

    /** server timestamp represented as millis since UTC epoch */
    timestamp: number,

    /** public key as a base 64 encoded string */
    publicKey: Base64Str,

    /** private key as a base 64 encoded string */
    privateKey: Base64Str,

    /** owner of this entity */
    owner: string,

    /** owner type */
    ownerType: OwnerType
}
