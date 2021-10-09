import React, {useEffect, useState} from 'react';
// import logo from './logo.svg';
import './App.css';
import {ApiPromise, Keyring, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";
import {Business, BusinessData, Community, Offering, OfferingData} from "./Types";
import {getChunks, uint8arrayToString} from './helpers';
import {localChain, remoteChain, getInfuraClient, getLocalClient} from "./settings";
import {BusinessComponent} from "./BusinessComponent";
import {OfferingComponent} from "./OfferingComponent";
import MockData from './MockData'

let client: any;
let api: any;
let keyring: Keyring;
let chain: string;
if (process.env.REACT_APP_MOCKING === "enabled") {
    console.log("Mocking enabled")
}
if (process.env.REACT_APP_LOCAL === "enabled") {
    console.log("local mode (ipfs & gesell)")
    chain = localChain;
    client = getLocalClient();
} else {
    console.log("remote mode (ipfs & gesell)")
    chain = remoteChain;
    client = getInfuraClient();
}

function App() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [chosenCommunity, setChosenCommunity] = useState();
    const connect = async () => {
        // let api: ApiPromise;
        keyring = new Keyring({type: 'sr25519'});
        const provider = new WsProvider(chain);
        try {
            api = await ApiPromise.create({
                ...options(),
                provider: provider
            });
            console.log(`${chain} wss connected success`);
            return true;
        } catch (err) {
            console.log(`connect ${chain} failed`);
            await provider.disconnect();
        }
    }
    connect();

    const getBusinessesCids = async (cid: string) => {
        if (await connect()) {
            try {
                const businessesList = await api.rpc.bazaar.getBusinesses(cid);
                // console.log("businesses from rpc call:", businessesList);
                let businessUrls: string[] = [];
                if (businessesList.length > 0) {
                    businessUrls = businessesList.map((e: BusinessData) => e['url'].toString());
                }
                return businessUrls;
            } catch (e) {
                console.log(e);
            }
        }
    }

    const getOfferingsCids = async (cid: string) => {
        if (await connect()) {
            try {
                const offeringsList = await api.rpc.bazaar.getOfferings(cid);
                // console.log("offerings from rpc call:", offeringsList);
                let offeringsUrls: string[] = [];
                if (offeringsList.length > 0) {
                    offeringsUrls = offeringsList.map((e: OfferingData) => e['url'].toString());
                }
                return offeringsUrls;
            } catch (e) {
                console.log(e);
            }
        }
    }

    useEffect(() => {
        getAllCommunities();
        // eslint-disable-next-line
    }, [])

    let communityList = communities.length > 0
        && communities.map((community, i) => {
            // console.log("a community from communities_state:", community);
            return (
                <option key={i} value={community.toString()}> {community['name']}</option>
            )
        });

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
        businesses = await getImageFromIpfsConvertToBase64AndSetProperty(client, businesses);
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
        offerings = await getImageFromIpfsConvertToBase64AndSetProperty(client, offerings);
        setOfferings(oldArray => [...oldArray, ...offerings]);

    }

    const getImageFromIpfsConvertToBase64AndSetProperty = async (client: any, businessesOrOfferings: any[]) => {
        let data: number[] = [];
        for (const element of businessesOrOfferings) {
            let image_cid = element['image_cid'];
            let stream = client.cat(image_cid);
            data = await getChunks(stream);
            let dataAsString = uint8arrayToString(data);
            element['image'] = btoa(dataAsString);
        }
        return businessesOrOfferings;
    }

    // useEffect(() => {
    //     console.log("state of communities is: ", communities);
    // }, [communities]);
    //
    useEffect(() => {
        console.log("state of businesses is: ", businesses);
    }, [businesses]);

    // eslint-disable-next-line
    const getOfferingsForBusiness = async (cid: string) => {
        if (await connect()) {
            const alice = keyring.addFromUri('//Alice', {name: 'Alice default'})
            const bid = api.createType('BusinessIdentifier', [cid, alice.publicKey]);
            try {
                return await api.rpc.bazaar.getOfferingsForBusiness(bid);
            } catch (e: any) {
                console.log(e);
            }
        }
    }

    const getAllCommunities = async () => {
        if (!(process.env.REACT_APP_MOCKING === "enabled")) {
            if (await connect()) {
                try {
                    const communitiesArray: Community[] = await api.rpc.communities.getAll();
                    setCommunities((oldArray: Community[]) => ([...oldArray, ...communitiesArray]));
                } catch (e: any) {
                    console.log(e);
                }
            }
        } else {
            let mock = new MockData();
            setCommunities((oldArray: Community[]) => [...oldArray, ...mock.communitiesMock]);
        }
    }

    function handleChange(e: any) {
        // console.log("the target is:", e.target.value);
        // console.log("targetCommunity", targetCommunity['name']);
        setBusinesses(() => []);
        setOfferings(() => []);
        // this is how you can for example get offerings for a business
        // getOfferingsForBusiness(targetCommunity['cid']).then((result: any) => {
        //     console.log("result of offeringsForBusinesses:", result);
        //     setOfferingsFromCids(result['url']);
        // } )

        if (!(process.env.REACT_APP_MOCKING === "enabled")) {
            let targetCommunity = JSON.parse(e.target.value);
            setChosenCommunity((targetCommunity) => targetCommunity);
            getBusinessesCids(targetCommunity['cid']).then((business_cids) => {
                let unsubscribeAll: any = null;
                if (business_cids) {
                    // console.log("business_cids:", business_cids);
                    setBusinessesFromCids(business_cids).then(unsub => {
                        unsubscribeAll = unsub;
                    })
                        .catch(console.error);
                    return () => unsubscribeAll && unsubscribeAll();
                }
            });
            getOfferingsCids(targetCommunity['cid']).then((offering_cids) => {
                let unsubscribeAll: any = null;
                if (offering_cids) {
                    // console.log("offering_cids:", offering_cids);
                    setOfferingsFromCids(offering_cids).then(unsub => {
                        unsubscribeAll = unsub;
                    })
                        .catch(console.error);
                    return () => unsubscribeAll && unsubscribeAll();
                }
            });
        } else {
            let mock = new MockData();
            setBusinesses(oldArray => ([...oldArray, ...mock.businessesMock]));
            setOfferings(oldArray => ([...oldArray, ...mock.offeringsMock]));
        }
    }

    return (
        <div className="App">
            <h1>Businesses And Offerings Per Community</h1>
            {(communities.length > 0) ? (
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
                : (<div>no communities</div>)}
            {businesses ? (
                <div>
                    <h2>Businesses</h2>
                    {
                        businesses.map((business, i) => (
                            <div key={i}>
                                <BusinessComponent business={business}/>
                                <img alt="business icon" src={`data:image/png;base64,${business['image']}`}/>
                            </div>
                        ))
                    }
                </div>
            ) : (<div>no businesses</div>)}
            {offerings ? (
                <div>
                    <h2>Offerings</h2>
                    {
                        offerings.map((offering, i) => (
                            <div key={i}>
                                <OfferingComponent offering={offering}/>
                                <img alt="offering icon" src={`data:image/png;base64,${offering['image']}`}/>
                            </div>
                        ))
                    }
                </div>
            ) : (<div>no offerings</div>)}
        </div>
    );
}

export default App;