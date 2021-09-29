import React, {useEffect, useState} from 'react';
// import logo from './logo.svg';
import './App.css';
import {ApiPromise, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";
import {Business, BusinessData, Offering, OfferingData} from "./Types";
import {getChunks, uint8arrayToString} from './helpers';
const ipfsClient = require('ipfs-http-client')

function App() {
    const client = ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
        }
    })

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
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

    const setBusinessesFromCids = async (cids: string[]) => {

        let data: number[] = [];
        let businesses: Business[] = [];
        for (const cid of cids) {
            let stream = client.cat(cid);
            data = await getChunks(stream);
            let dataAsString = uint8arrayToString(data);
            let business: Business = JSON.parse(dataAsString);
            businesses.push(business);
        }
        setBusinesses(oldArray => ([...oldArray, ...businesses]));
    }

    const setOfferingsFromCids = async (cids: string[]) => {
        let data: number[] = [];
        let offerings: Offering[] = [];
        for (const cid of cids) {
            let stream = client.cat(cid);
            data = await getChunks(stream);
            let dataAsString = uint8arrayToString(data);
            let offering: Offering = JSON.parse(dataAsString);
            offerings.push(offering)
        }
        setOfferings(oldArray => [...oldArray, ...offerings]);

    }

    const onCommunityChange = (communities: []) => {
        setCommunities(communities);
    }

    // useEffect(() => {
    //     console.log("state of communities is: ", communities);
    // }, [communities]);
    //
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

    const getBusinessesCids = async (cid: string) => {
        if(await connect()) {
            try{
                const businessesList = await api.rpc.bazaar.getBusinesses(cid);
                // console.log("businesses from rpc call:", businessesList);
                let businessUrls: string[] = [];
                if(businessesList.length > 0) {
                    businessUrls = businessesList.map((e: BusinessData) => e['url'].toString());
                }
                return businessUrls;
            }
            catch(e){
                console.log(e);
            }
        }
    }

    const getOfferingsCids = async (cid: string) => {
        if(await connect()) {
            try{
                const offeringsList = await api.rpc.bazaar.getOfferings(cid);
                console.log("offerings from rpc call:", offeringsList);
                // setOfferings((offeringsList) => offerings);
                let offeringsUrls: string[] = [];
                // first convert every object to Offering and then do it
                if(offeringsList.length > 0) {
                    offeringsUrls = offeringsList.map((e: OfferingData) => e['url'].toString());
                }
                return offeringsUrls;
            }
            catch(e){
                console.log(e);
            }
        }
    }

    useEffect(()=> {
        getAllCommunities();
        // eslint-disable-next-line
    }, [])

    let communityList = communities.length > 0
        && communities.map((community, i) => {
            // console.log("a community from communities_state:", community);
            return (
                <option key={i} value={community}> {community['name']}</option>
            )
        });

    function handleChange (e: any) {
        // console.log("the target is:", e.target.value);
        let targetCommunity = JSON.parse(e.target.value);
        console.log("targetCommunity", targetCommunity['name']);
        setChosenCommunity((targetCommunity) => targetCommunity);
        setBusinesses(() => []);
        setOfferings(() => []);

        getBusinessesCids(targetCommunity['cid']).then((business_cids) => {
            let unsubscribeAll: any = null;
            if(business_cids) {
                console.log("business_cids:", business_cids);
                setBusinessesFromCids(business_cids).then(unsub => {
                    unsubscribeAll = unsub;
                })
                    .catch(console.error);
                return () => unsubscribeAll && unsubscribeAll();
            }
        });
        getOfferingsCids(targetCommunity['cid']).then((offering_cids) => {
            let unsubscribeAll: any = null;
            if(offering_cids) {
                console.log("offering_cids:", offering_cids);
                setOfferingsFromCids(offering_cids).then(unsub => {
                    unsubscribeAll = unsub;
                })
                    .catch(console.error);
                return () => unsubscribeAll && unsubscribeAll();
            }
        });
    }

    return (
        <div className="App">
            <h1>Businesses And Offerings Per Community</h1>
            {communities ? (
                    <div>
                        <select
                            defaultValue="choose a community"
                            value={chosenCommunity}
                            onChange={handleChange}
                        >
                            <option disabled>choose a community</option>
                            {communityList}
                        </select>
                    </div>)
                :
                (<div> </div>)
            }
            {businesses ? (
                    <div>
                        <h2>Businesses</h2>
                        {
                            businesses.map((business, i) => (
                                <ul>
                                    <li key={i}>
                                        Name: {business.name}
                                        <p> Description: {business.description} </p>
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
            {offerings ? (
                    <div>
                        <h2>Offerings</h2>
                        {
                            offerings.map((offering, i) => (
                                <ul>
                                    <li key={i}>
                                        <p> name: {offering.name} </p>
                                        <p> price: {offering.price} </p>
                                        <p> community: {offering.community} </p>
                                    </li>
                                </ul>
                            ))
                        }
                    </div>
            ) :
                (
                    <div> </div>
                )

            }
        </div>
    );
}

export default App;