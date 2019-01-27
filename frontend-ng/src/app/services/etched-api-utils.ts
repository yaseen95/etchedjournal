import { environment } from '../../environments/environment';
import { Base64Str } from '../models/encrypted-entity';

export const SELF_URL = `${environment.API_URL}/auth/self`;
export const ENTRIES_URL = `${environment.API_URL}/entries`;
export const ETCHES_URL = `${environment.API_URL}/etches`;
export const JOURNALS_URL = `${environment.API_URL}/journals`;
export const KEYPAIRS_URL = `${environment.API_URL}/keypairs`;

// Used for GET params
export const ENTRY_ID = 'entryId';
export const JOURNAL_ID = 'journalId';

/** Routes that require a valid access token */
export const AUTH_REQUIRED_URLS = [
    SELF_URL,
    ENTRIES_URL,
    ETCHES_URL,
    JOURNALS_URL,
    KEYPAIRS_URL,
];

export interface EncryptedEntityRequest {
    content: Base64Str;
    keyPairId: string;
}
