import { Schema } from '../services/models/schema';

export interface Reader<T> {
    read(data: any | any[]): T;
}

export class SimpleReader<T> implements Reader<T> {
    private static INSTANCE = new SimpleReader<any>();

    public static getReader<T>(schema: Schema): Reader<T> {
        switch (schema) {
            case Schema.V1_0:
                return this.INSTANCE;
            default:
                throw new Error(`Unsupported version: ${schema}`);
        }
    }

    public read(data: any | any[]): T {
        return data as T;
    }
}
