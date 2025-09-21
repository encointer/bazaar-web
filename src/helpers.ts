export function uint8arrayToString(myUint8Arr: number[]){
    return String.fromCharCode.apply(null, myUint8Arr);
}


/**
 * For some reason the `Community.name` field is returned as the utf8-char codes in a string.
 * @param input
 */
export function decodeByteArrayString(input: string): string {
    // split by comma and trim spaces
    const byteValues = input.split(",").map(s => parseInt(s.trim(), 10));

    // create a Uint8Array from the numbers
    const byteArray = new Uint8Array(byteValues);

    // decode as UTF-8
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(byteArray);
}


/**
 * Iterates over all chunks of the ipfs data stream
 * Returns: Uint8Array, which should be converted later to readable string
 */
export async function getChunks(stream: []) {
    let data: number[] = [];
    for await (let chunk of stream) {
        // console.log(uint8arrayToStringMethod(chunk));
        data.push.apply(data,chunk);
    }
    return data;
}
