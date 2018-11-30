import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EtchedUser } from '../models/etched-user';

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
        id: '123-456'
    };

    /** base64 encoded byte array of [1, 2, 3, 4] */
    export const MOCK_PUB_KEY_BASE_64_STR = 'AQIDBA==';

    /** base64 encoded byte arary of [5, 6, 7, 8] */
    export const MOCK_PRIV_KEY_BASE_64_STR = 'BQYHCA==';
}
