export function uint8arrayToString(myUint8Arr: number[]){
    return String.fromCharCode.apply(null, myUint8Arr);
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