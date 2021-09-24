import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";

import {BusinessData, Business} from "./Types";

// businessCid1 = QmXGsZKHxMhaP8a2PCHPb4vtZJ1trLyChmQdu2oWCG9eDP;
// businessCid2 = QmS7YPfCBfjqMux5AYd5VaYjHG8tEcvzShEBNpHtXT8t5y;

function App() {
    function uint8arrayToString(myUint8Arr: number[]){
        return String.fromCharCode.apply(null, myUint8Arr);
    }

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [communities, setCommunities] = useState([]);
    const [chosenCommunity, setChosenCommunity] = useState();
    let api: any;

    const connect = async () => {
        // let api: ApiPromise;
        const chain = 'ws://127.0.0.1:9944';
        const provider = new WsProvider('ws://127.0.0.1:9944');
        try {
            api = await ApiPromise.create({
                ...options(),
                provider: provider
            });
            console.log(`${chain} wss connected success`);
            return true;
        }
        catch (err) {
            console.log(`connect ${chain} failed`);
            await provider.disconnect();
        }
    }
    connect();

    const catBusinessInfoFromInfura = async (businessCids: string[]) => {
        const ipfsClient = require('ipfs-http-client')
        const client = ipfsClient.create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
            }
        })

        businessCids.forEach((cid: string) => {
            let stream = client.cat(cid);
            getChunks(stream);
        });
        // let stream = client.cat('QmXGsZKHxMhaP8a2PCHPb4vtZJ1trLyChmQdu2oWCG9eDP');

        async function getChunks(stream: []) {
            let data: number[] = [];
            for await (let chunk of stream) {
                // console.log(uint8arrayToStringMethod(chunk));
                data.push.apply(data,chunk);
            }

            let businessDataString = uint8arrayToString(data);
            let businessData: Business = JSON.parse(businessDataString);
            setBusinesses(oldArray => [...oldArray, businessData]);
        }

    }

    const onCommunityChange = (communities: []) => {
        setCommunities(communities);
    }

    useEffect(() => {
        console.log("state of communities is: ", communities);
    }, [communities]);

    useEffect(() => {
        console.log("state of businesses is: ", businesses);
    }, [businesses]);

    const getAllCommunities = async () => {
        if(await connect()) {
            try {
                const communitiesArray = await api.rpc.communities.getAll();
                onCommunityChange(communitiesArray);
            }
            catch(e: any) {
                console.log(e);
            }
        }
    }

    const getBusinessesFromIpfsCid = async (cid: string) => {
        if(await connect()) {
            // const communitiesArray = await api.rpc.communities.getAll();
            // setCommunities((oldArray => [...oldArray, communitiesArray]));
            // onCommunityChange(communitiesArray);

            //here we later wont take it like that but pass the actual wanted community
            const businessesList = await api.rpc.bazaar.getBusinesses(cid);
            console.log("businesses from rpc call:", businessesList);
            let businessUrls: string[] = [];

            if(businessesList.length > 0) {
                businessUrls = businessesList.map((e: BusinessData) => e['url'].toString());
            }

            return businessUrls;
        }
    }

    useEffect(()=> {
        getAllCommunities();
        // eslint-disable-next-line
    }, [])

    // useEffect(() => {
    //     let unsubscribeAll: any = null;
    //     getBusinessesFromIpfsCid(chosenCommunity).then(business_cids => {
    //         if(business_cids) {
    //             catBusinessInfoFromInfura(business_cids);
    //         }
    //     })
    //         .then(unsub => {
    //             unsubscribeAll = unsub;
    //         })
    //         .catch(console.error);
    //     return () => unsubscribeAll && unsubscribeAll();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    let communityList = communities.length > 0
        && communities.map((community, i) => {
            // console.log("a community from communities_state:", community);
            return (
                <option key={i} value={community}> {community['name']}</option>
            )
        });

    function handleChange (e: any) {
        console.log("the target is:", e.target.value);
        let targetCommunity = JSON.parse(e.target.value);
        console.log("targetCommunity", targetCommunity['name']);
        setChosenCommunity((targetCommunity) => targetCommunity);
        setBusinesses(() => []);

        getBusinessesFromIpfsCid(targetCommunity['cid']).then((business_cids) => {
                if(business_cids) {
                    console.log("business_cids_:", business_cids);
                    catBusinessInfoFromInfura(business_cids);
                }
            })
    }

    return (
        <div className="App">
            <h1>Businesses Per Community</h1>
            {communities ? (
            <div>
                <select
                    // defaultValue={communities[0]}
                    value={chosenCommunity}
                        onChange={handleChange}
                >
                    <option disabled selected> -- choose a community -- </option>
                    {communityList}
                </select>
            </div>)
                :
                (<div> </div>)
            }
            {businesses ? (
                    <div>
                        {
                            businesses.map((business, i) => (
                                <ul>
                                    <li key={i}>
                                        Name: {business.name}
                                        {/*<br> </br>*/}
                                        Description: {business.description}
                                    </li>
                                </ul>
                            ))
                        }
                    </div>
                )
                :
                (
                    <div>businesses empty</div>
                )
            }
        </div>
    );
}

export default App;