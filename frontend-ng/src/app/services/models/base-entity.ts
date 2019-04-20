import { OwnerType } from './owner-type';

export interface BaseEntity {
    /** id of this entity */
    id: string;

    /** server timestamp represented as millis since UTC epoch */
    timestamp: number;

    /** owner of this entity */
    // TODO: Is owner the right name?
    owner: string;

    /** owner type */
    ownerType: OwnerType;

    // TODO: Actually send version as part of
    version: number;
}
