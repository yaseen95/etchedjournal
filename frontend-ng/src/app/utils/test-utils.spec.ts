import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EtchV1 } from '../models/etch/etch-v1';
import { EntryEntity } from '../services/models/entry-entity';
import { EtchEntity } from '../services/models/etch-entity';
import { EtchedUser } from '../services/models/etched-user';
import { JournalEntity } from '../services/models/journal-entity';
import { OwnerType } from '../services/models/owner-type';
import { Schema } from '../services/models/schema';

export namespace TestUtils {
    /**
     * Query a debug element and get a single element that matches the given query expression
     *
     * This method asserts that there is only a single element that matches the given query and
     * will fail if there are 0 or more than 1 matching elements.
     *
     * @param element the element from which to search
     * @param queryExpr css query expression
     * @return the sole element matching the query expression
     */
    export function queryExpectOne(element: DebugElement, queryExpr: string): DebugElement {
        const matching = element.queryAll(By.css(queryExpr));
        expect(matching.length).toEqual(1);
        return matching[0];
    }

    /**
     * Update the value of an HTML input element and dispatch an input event
     * @param input the element to update
     * @param value the value to set
     */
    export function updateValue(input: HTMLInputElement, value: string) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
    }

    /**
     * Query a debug element and expect no items to match the given query expression
     *
     * @param element the element from which to search
     * @param queryExpr css query expression
     */
    export function queryExpectNone(element: DebugElement, queryExpr: string): void {
        const matching = element.queryAll(By.css(queryExpr));
        expect(matching.length).toEqual(0);
    }

    export const TEST_USER: EtchedUser = {
        username: 'samsepiol',
        email: null,
        id: '123-456',
    };

    /** base64 encoded byte array of [1, 2, 3, 4] */
    export const MOCK_PUB_KEY_BASE_64_STR = 'AQIDBA==';

    /** base64 encoded byte arary of [5, 6, 7, 8] */
    export const MOCK_PRIV_KEY_BASE_64_STR = 'BQYHCA==';

    export function createEntryEntity(entity?: Partial<EntryEntity>): EntryEntity {
        entity = getIfDefinedOrDefault(entity, {});
        return {
            id: getIfDefinedOrDefault(entity.id, 'id'),
            created: getIfDefinedOrDefault(entity.created, 0),
            modified: getIfDefinedOrDefault(entity.modified, null),
            journalId: getIfDefinedOrDefault(entity.journalId, 'jId'),
            content: getIfDefinedOrDefault(entity.content, 'ciphertext'),
            keyPairId: getIfDefinedOrDefault(entity.keyPairId, 'kpId'),
            owner: getIfDefinedOrDefault(entity.owner, 'owner'),
            ownerType: getIfDefinedOrDefault(entity.ownerType, OwnerType.USER),
            schema: getIfDefinedOrDefault(entity.schema, Schema.V1_0),
            version: getIfDefinedOrDefault(entity.version, 1),
        };
    }

    export function createJournalEntity(entity?: Partial<JournalEntity>): JournalEntity {
        entity = getIfDefinedOrDefault(entity, {});
        return {
            id: getIfDefinedOrDefault(entity.id, 'id'),
            created: getIfDefinedOrDefault(entity.created, 0),
            modified: getIfDefinedOrDefault(entity.modified, null),
            content: getIfDefinedOrDefault(entity.content, 'ciphertext'),
            keyPairId: getIfDefinedOrDefault(entity.keyPairId, 'kpId'),
            owner: getIfDefinedOrDefault(entity.owner, 'owner'),
            ownerType: getIfDefinedOrDefault(entity.ownerType, OwnerType.USER),
            schema: getIfDefinedOrDefault(entity.schema, Schema.V1_0),
            version: getIfDefinedOrDefault(entity.version, 1),
        };
    }

    export function createEtchEntity(entity?: Partial<EtchEntity>): EtchEntity {
        entity = getIfDefinedOrDefault(entity, {});
        return {
            id: getIfDefinedOrDefault(entity.id, 'id'),
            created: getIfDefinedOrDefault(entity.created, 0),
            content: getIfDefinedOrDefault(entity.content, 'ciphertext'),
            keyPairId: getIfDefinedOrDefault(entity.keyPairId, 'kpId'),
            owner: getIfDefinedOrDefault(entity.owner, 'owner'),
            ownerType: getIfDefinedOrDefault(entity.ownerType, OwnerType.USER),
            entryId: getIfDefinedOrDefault(entity.entryId, 'entryId'),
            schema: getIfDefinedOrDefault(entity.schema, Schema.V1_0),
            version: getIfDefinedOrDefault(entity.version, 1),
        };
    }

    export function getIfDefinedOrDefault<T>(x: T | undefined, defaultX: T): T {
        // called defaultX because `default` is reserved and I can't call it `default_` due to
        // linting
        return x === undefined ? defaultX : x;
    }

    export function triggerKeyUp(de: DebugElement, key: string) {
        de.triggerEventHandler('keyup', { key });
    }

    export function triggerInput(de: DebugElement) {
        de.triggerEventHandler('input', { target: de.nativeElement });
    }

    export function triggerBlur(de: DebugElement) {
        de.triggerEventHandler('blur', null);
    }

    export function createEtch(content: string, created: number = 0): EtchV1 {
        return new EtchV1({ content, created });
    }
}
