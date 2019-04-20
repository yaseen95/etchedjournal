import { Version } from './version';

export interface Reader<T> {
    read(data: any | any[]): T;
}

export class SimpleReader<T> implements Reader<T> {
    private static INSTANCE = new SimpleReader<any>();

    public static getReader<T>(version: Version): Reader<T> {
        switch (version.major) {
            case 1:
                return this.INSTANCE;
            default:
                throw new Error(`Unsupported version: ${version.toString()}`);
        }
    }

    public read(data: any | any[]): T {
        return data as T;
    }
}
