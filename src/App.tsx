import React, {useEffect, useState} from "react";
// import logo from './logo.svg';
import "./App.css";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {options} from "@encointer/node-api/options";
import {
    BusinessDisplay,
    Offering,
    OfferingData,
} from "./Types";
import {localChain, remoteChain} from "./settings";
import {BusinessComponent} from "./BusinessComponent";
import {OfferingComponent} from "./OfferingComponent";
import {loadJsonFromIpfs} from "./ipfs";
import {CidName, CommunityIdentifier, Business} from "@encointer/types";
import {communityIdentifierFromString, communityIdentifierToString} from "@encointer/util";
import {decodeByteArrayString} from "./helpers";
import { getBusinesses } from "@encointer/node-api";


let api: any;
// let keyring: Keyring;
let chain: string;
if (process.env['REACT_APP_MOCKING'] === "enabled") {
    console.log("Mocking enabled");
}
if (process.env['REACT_APP_LOCAL'] === "enabled") {
    console.log("local mode (ipfs & gesell)");
    chain = localChain;
} else if (process.env['REACT_APP_LOCAL_CHAIN_REMOTE_IPFS'] === "enabled") {
    console.log("local mode chain and remote ipfs");
    chain = localChain;
} else {
    console.log("remote mode (ipfs & gesell)");
    chain = remoteChain;
}

function App() {
    const [businessesDisplay, setBusinessesDisplay] = useState<BusinessDisplay[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [communities, setCommunities] = useState<CidName[]>([]);
    const [chosenCommunity, setChosenCommunity] = useState<string | undefined>(undefined);


    const connect = async () => {
        // keyring = new Keyring({type: "sr25519"});
        const provider = new WsProvider(chain);
        try {
            // @ts-ignore
            api = await ApiPromise.create({
                ...options(),
                provider: provider,
            });
            console.log(`${chain} wss connected success`);
        } catch (err) {
            console.log(`connect ${chain} failed`);
            await provider.disconnect();
        }
    };
    connect();

    const getBusinessesUrl = async (cid: CommunityIdentifier) => {
        await connect()
        try {
            const businesses = await getBusinesses(api, cid);
            console.log("businesses from rpc call:", JSON.stringify(businesses));

            let businessUrls: string[] = [];
            businessUrls = businesses.map((business: Business) =>
                business.businessData.url.toString()
            );

            return businessUrls;
        } catch (e) {
            console.log(e);
            return [];
        }

    };

    const getOfferingsCids = async (cid: CommunityIdentifier) => {
        await connect()

        try {
            const offeringsList =
                await api.rpc.encointer.bazaarGetOfferings(cid);
            // console.log("offerings from rpc call:", offeringsList);
            let offeringsUrls: string[] = [];
            if (offeringsList.length > 0) {
                offeringsUrls = offeringsList.map((e: OfferingData) =>
                    e["url"].toString()
                );
            }
            return offeringsUrls;
        } catch (e) {
            console.log(e);
            return [];
        }
    };

    useEffect(() => {
        getAllCommunities();
        // eslint-disable-next-line
    }, []);

    let communityList =
        communities.length > 0 &&
        communities.map((cidName, i) => {
            let name = decodeByteArrayString(cidName.name.toString());

            return (
                <option key={i} value={communityIdentifierToString(cidName.cid).toString()}>
                    {" "}
                    {name}
                </option>
            );
        });

    const setBusinessesFromCids = async (cids: string[]) => {
        let businesses: BusinessDisplay[] = [];
        for (const cid of cids) {
            let business: BusinessDisplay = await loadJsonFromIpfs(cid);
            console.log(business);
            businesses.push(business);
        }
        setBusinessesDisplay((oldArray) => [...oldArray, ...businesses]);
    };

    const setOfferingsFromCids = async (cids: string[]) => {
        let offerings: Offering[] = [];
        for (const cid of cids) {
            const res = await loadJsonFromIpfs(cid);
            res.itemOffered = await loadJsonFromIpfs(res.itemOffered);
            let offering: Offering = res;
            offerings.push(offering);
        }
        setOfferings((oldArray) => [...oldArray, ...offerings]);
    };

    useEffect(() => {
        console.log("state of businesses is: ", businessesDisplay);
    }, [businessesDisplay]);

    // const getOfferingsForBusiness = async (cid: string) => {
    //     await connect()
    //     const alice = keyring.addFromUri("//Alice", {
    //         name: "Alice default",
    //     });
    //     const bid = api.createType("BusinessIdentifier", [
    //         cid,
    //         alice.publicKey,
    //     ]);
    //     try {
    //         return await api.rpc.encointer.bazaarGetOfferingsForBusiness(
    //             bid
    //         );
    //     } catch (e: any) {
    //         console.log(e);
    //     }
    // };

    const getAllCommunities = async () => {
        await connect()
        try {
            const communitiesArray: CidName[] =
                await api.rpc.encointer.getAllCommunities();

            setCommunities((oldArray: CidName[]) => [
                ...oldArray,
                ...communitiesArray,
            ]);
        } catch (e: any) {
            console.log(e);
        }

    };

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setBusinessesDisplay(() => []);
        setOfferings(() => []);

        const cidString = e.target.value;
        setChosenCommunity(cidString);

        let cid = communityIdentifierFromString(api.registry, cidString)

        getBusinessesUrl(cid).then((business_cids) => {
            if (business_cids) {
                // console.log("business_cids:", business_cids);
                setBusinessesFromCids(business_cids)
                    .catch(console.error);
            }
        });
        getOfferingsCids(cid).then((offering_cids) => {
            if (offering_cids) {
                // console.log("offering_cids:", offering_cids);
                setOfferingsFromCids(offering_cids)
                    .catch(console.error);
            }
        });
    }

    return (
        <div className="App">
            <h1>Businesses And Offerings Per Community</h1>
            {communities.length > 0 ? (
                <div>
                    <select
                        defaultValue="choose a community"
                        value={chosenCommunity}
                        onChange={handleChange}
                    >
                        <option disabled>choose a community</option>
                        {communityList}
                    </select>
                </div>
            ) : (
                <div>no communities</div>
            )}
            {businessesDisplay ? (
                <div>
                    <h2>Businesses</h2>
                    {businessesDisplay.map((business, i) => (
                        <div key={i}>
                            <BusinessComponent business={business}/>
                        </div>
                    ))}
                </div>
            ) : (
                <div>no businesses</div>
            )}
            {offerings ? (
                <div>
                    <h2>Offerings</h2>
                    {offerings.map((offering, i) => (
                        <div key={i}>
                            <OfferingComponent offering={offering}/>
                        </div>
                    ))}
                </div>
            ) : (
                <div>no offerings</div>
            )}
        </div>
    );
}

export default App;
