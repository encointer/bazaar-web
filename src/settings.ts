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
}

