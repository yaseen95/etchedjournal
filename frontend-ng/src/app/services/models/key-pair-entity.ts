import { OwnerType } from './owner-type';
import { Base64Str } from './types';

export interface KeyPairEntity {
    /** id of this entity */
    id: string;
    /** server timestamp entity was created (as millis since UTC epoch) */
    created: number;
    /** owner of this entity */
    owner: string;
    /** owner type */
    ownerType: OwnerType;
    /** public key as a base 64 encoded string */
    publicKey: Base64Str;
    /** private key as a base 64 encoded string */
    privateKey: Base64Str;
    /** current version of entity */
    version: number;
    salt: string;
    iterations: number;
}
