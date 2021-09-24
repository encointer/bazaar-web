import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";

import {BusinessData, Business} from "./Types";
// import { Input } from 'semantic-ui-react';

// businessCid1 = QmXGsZKHxMhaP8a2PCHPb4vtZJ1trLyChmQdu2oWCG9eDP;
// businessCid2 = QmS7YPfCBfjqMux5AYd5VaYjHG8tEcvzShEBNpHtXT8t5y;
// import CharacterDropDown from './Dropdown';

function App() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [communities, setCommunities] = useState([]);
    const [chosenCommunity, setChosenCommunity] = useState();
    let api: any;

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

    function uint8arrayToString(myUint8Arr: number[]){
        return String.fromCharCode.apply(null, myUint8Arr);
    }

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

    const onCommunityChange = (communities: []) => {
        setCommunities(communities);
    }


    useEffect(() => {
        // async function getCommunities() {
        //   const communitiesArray = await api.rpc.communities.getAll();
        //   // setCommunities((oldArray => [...oldArray, communitiesArray]));
        // }
        // getCommunities();
        console.log("state of communities is: ", communities);
    }, [communities]);

    useEffect(() => {
        console.log("state of businesses is: ", businesses);
    }, [businesses]);


    const getBusinessesFromIpfsCid = async () => {
        if(await connect()) {

            const communitiesArray = await api.rpc.communities.getAll();
            // setCommunities((oldArray => [...oldArray, communitiesArray]));
            onCommunityChange(communitiesArray);

            //here we later wont take it like that but pass the actual wanted community
            const businessesList = await api.rpc.bazaar.getBusinesses(communitiesArray[1]['cid'].toString());
            console.log("businesses from rpc call:", businessesList);
            let businessUrls: string[];

            // let exampleJsons: any[] = [];
            if(businessesList.length > 0) {
                businessUrls = businessesList.map((e: BusinessData) => e['url'].toString());
                return businessUrls;
            }
        }
    }

    useEffect(() => {
        let unsubscribeAll: any = null;
        getBusinessesFromIpfsCid().then(business_cids => {
            if(business_cids) {
                catBusinessInfoFromInfura(business_cids);
            }
        })
            .then(unsub => {
                unsubscribeAll = unsub;
            })
            .catch(console.error);
        return () => unsubscribeAll && unsubscribeAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let communityList = communities.length > 0
        && communities.map((community, i) => {
            console.log("a community from communities_state:", community);
            return (
                <option key={i} value={community}> {community['name']}</option>
            )
        });

    function handleChange (e: any) {
        console.log("the target is:", e.target.value);
        setChosenCommunity(e.target.value);
    }
    return (
        <div className="App">
            <h1>Businesses Per Community</h1>
            <div>
                <select value={chosenCommunity}
                        onChange={handleChange}
                >
                    {communityList}
                </select>
            </div>

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