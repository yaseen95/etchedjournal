/**
 * Slice a string into chunks of size `sliceSize`
 *
 * Last chunk will contain the remainder of the s after splitting it up into `sliceSize` chunks
 * and may not be exactly `sliceSize` in length.
 *
 * @param s string to slice
 * @param sliceSize size of each chunk
 */
export function sliceStr(s: string, sliceSize: number): Array<string> {
    const chunks = [];

    for (let i = 0; i < s.length;) {
        chunks.push(s.substr(i, i + sliceSize));
        i += sliceSize;
    }

    return chunks;
}

export const RANDOM_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export class RandomUtils {

    static randomStr(length: number): string {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        const s = new Array<string>(length);
        for (let i = 0; i < length; i++) {
            const rand = Math.floor(Math.random() * RANDOM_CHARS.length);
            s[i] = RANDOM_CHARS[rand];
        }
        return s.join('');
    }
}

