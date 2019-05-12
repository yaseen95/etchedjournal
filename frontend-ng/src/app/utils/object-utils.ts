const isEqualInternal = require('lodash.isequal');

export class ObjectUtils {
    public static isDefined<T>(x: T): boolean {
        return x !== null && x !== undefined;
    }

    public static isNotDefined<T>(x: T): boolean {
        return x === null || x === undefined;
    }
}

export function isEqual(a: any, b: any): boolean {
    return isEqualInternal(a, b);
}

export function removeDuplicates<T>(values: T[]): T[] {
    const deduplicated = [];
    values.forEach(val1 => {
        const idx = deduplicated.findIndex(val2 => isEqual(val1, val2));
        if (idx === -1) {
            deduplicated.push(val1);
        }
    });
    return deduplicated;
}
