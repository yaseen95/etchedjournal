import { Schema } from '../services/models/schema';

export interface Writer<T> {
    write(data: T): string;
}

export class SimpleWriter<T> implements Writer<T> {
    private static INSTANCE = new SimpleWriter();

    public static getWriter<T>(schema: Schema): Writer<T> {
        switch (schema) {
            case Schema.V1_0:
                return this.INSTANCE;
            default:
                throw new Error(`Unsupported version: ${schema}`);
        }
    }

    public write(data: T): string {
        return JSON.stringify(data);
    }
}
