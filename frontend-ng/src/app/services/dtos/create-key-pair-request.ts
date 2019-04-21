import { Base64Str } from '../models/types';

export interface CreateKeyPairRequest {
    publicKey: Base64Str;
    privateKey: Base64Str;
    salt: string;
    iterations: number;
}
