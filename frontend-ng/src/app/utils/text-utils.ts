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
