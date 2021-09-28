export default function uint8arrayToString(myUint8Arr: number[]){
    return String.fromCharCode.apply(null, myUint8Arr);
}