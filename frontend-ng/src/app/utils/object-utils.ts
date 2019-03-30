export class ObjectUtils {
    public static isDefined<T>(x: T): boolean {
        return x !== null && x !== undefined;
    }

    public static isNotDefined<T>(x: T): boolean {
        return x === null || x === undefined;
    }
}
