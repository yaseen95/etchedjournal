import { BaseEntity } from './base-entity';
import { Base64Str } from './encrypted-entity';

export interface KeyPairEntity extends BaseEntity {
    /** public key as a base 64 encoded string */
    publicKey: Base64Str;

    /** private key as a base 64 encoded string */
    privateKey: Base64Str;

    salt: string;
    iterations: number;
}
