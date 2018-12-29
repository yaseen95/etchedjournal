import { Base64Str } from '../../models/encrypted-entity';

export interface CreateKeyPairRequest {
    publicKey: Base64Str,
    privateKey: Base64Str,
    salt: string,
    iterations: number,
}
