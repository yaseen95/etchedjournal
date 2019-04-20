import { Version } from './version';

export interface Writer<T> {
    write(data: T): string;
}

export class SimpleWriter<T> implements Writer<T> {
    private static INSTANCE = new SimpleWriter();

    public static getWriter<T>(version: Version): Writer<T> {
        switch (version.major) {
            case 1:
                return this.INSTANCE;
            default:
                throw new Error(`Unsupported version: ${version.toString()}`);
        }
    }

    public write(data: T): string {
        return JSON.stringify(data);
    }
}
