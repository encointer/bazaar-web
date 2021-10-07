const ipfsClient = require('ipfs-http-client')
// const ipfsClient = require('ipfs-api')

/*
I exported the client to a external method... best practice?
I guess it usually is exported as a variable? TBD
*/
export const getInfuraClient = () => {
    return ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
        }
    })
};

export const getLocalClient = () => {
    return ipfsClient.create({
        host: '127.0.0.1',
        port: 5001,
        protocol: 'https'
    })
};

export const localChain = 'ws://127.0.0.1:9944';

export const remoteChain = 'wss://gesell.encointer.org';
