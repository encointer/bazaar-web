import { useEffect, useState } from "react";
// import logo from './logo.svg';
import "./App.css";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { options } from "@encointer/node-api/options";
import {
    Business,
    BusinessData,
    Community,
    Offering,
    OfferingData,
} from "./Types";
import { localChain, remoteChain } from "./settings";
import { BusinessComponent } from "./BusinessComponent";
import { OfferingComponent } from "./OfferingComponent";
import { loadJsonFromIpfs } from "./ipfs";
import { decodeByteArrayString } from "./helpers";

let api: any;
let keyring: Keyring;
let chain: string;
if (process.env.REACT_APP_MOCKING === "enabled") {
    console.log("Mocking enabled");
}
if (process.env.REACT_APP_LOCAL === "enabled") {
    console.log("local mode (ipfs & gesell)");
    chain = localChain;
} else if (process.env.REACT_APP_LOCAL_CHAIN_REMOTE_IPFS === "enabled") {
    console.log("local mode chain and remote ipfs");
    chain = localChain;
} else {
    console.log("remote mode (ipfs & gesell)");
    chain = remoteChain;
}

function App() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [chosenCommunity, setChosenCommunity] = useState();
    const connect = async () => {
        // let api: ApiPromise;
        keyring = new Keyring({ type: "sr25519" });
        const provider = new WsProvider(chain);
        try {
            api = await ApiPromise.create({
                ...options(),
                provider: provider,
            });
            console.log(`${chain} wss connected success`);
            return true;
        } catch (err) {
            console.log(`connect ${chain} failed`);
            await provider.disconnect();
        }
    };
    connect();

    const getBusinessesCids = async (cid: string) => {
        if (await connect()) {
            try {
                const businessesList =
                    await api.rpc.encointer.bazaarGetBusinesses(cid);
                // console.log("businesses from rpc call:", businessesList);
                let businessUrls: string[] = [];
                if (businessesList.length > 0) {
                    businessUrls = businessesList.map((e: BusinessData) =>
                        e["url"].toString()
                    );
                }
                return businessUrls;
            } catch (e) {
                console.log(e);
            }
        }
    };

    const getOfferingsCids = async (cid: string) => {
        if (await connect()) {
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
            }
        }
    };

    useEffect(() => {
        getAllCommunities();
        // eslint-disable-next-line
    }, []);

    let communityList =
        communities.length > 0 &&
        communities.map((community, i) => {
            return (
                <option key={i} value={community.toString()}>
                    {" "}
                    {community.name}
                </option>
            );
        });

    const setBusinessesFromCids = async (cids: string[]) => {
        let businesses: Business[] = [];
        for (const cid of cids) {
            let business: Business = await loadJsonFromIpfs(cid);
            console.log(business);
            businesses.push(business);
        }
        setBusinesses((oldArray) => [...oldArray, ...businesses]);
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
        console.log("state of businesses is: ", businesses);
    }, [businesses]);

    // eslint-disable-next-line
    const getOfferingsForBusiness = async (cid: string) => {
        if (await connect()) {
            const alice = keyring.addFromUri("//Alice", {
                name: "Alice default",
            });
            const bid = api.createType("BusinessIdentifier", [
                cid,
                alice.publicKey,
            ]);
            try {
                return await api.rpc.encointer.bazaarGetOfferingsForBusiness(
                    bid
                );
            } catch (e: any) {
                console.log(e);
            }
        }
    };

    const getAllCommunities = async () => {
        if (await connect()) {
            try {
                const communitiesArray: Community[] =
                    await api.rpc.encointer.getAllCommunities();

                let comms = communitiesArray.map((community) => {
                    return { ...community, name: decodeByteArrayString(community.name) };
                })

                setCommunities((oldArray: Community[]) => [
                    ...oldArray,
                    ...comms,
                ]);
            } catch (e: any) {
                console.log(e);
            }
        }
    };

    function handleChange(e: any) {
        setBusinesses(() => []);
        setOfferings(() => []);

        let targetCommunity = JSON.parse(e.target.value);
        setChosenCommunity((targetCommunity) => targetCommunity);
        getBusinessesCids(targetCommunity["cid"]).then((business_cids) => {
            let unsubscribeAll: any = null;
            if (business_cids) {
                // console.log("business_cids:", business_cids);
                setBusinessesFromCids(business_cids)
                    .then((unsub) => {
                        unsubscribeAll = unsub;
                    })
                    .catch(console.error);
                return () => unsubscribeAll && unsubscribeAll();
            }
        });
        getOfferingsCids(targetCommunity["cid"]).then((offering_cids) => {
            let unsubscribeAll: any = null;
            if (offering_cids) {
                // console.log("offering_cids:", offering_cids);
                setOfferingsFromCids(offering_cids)
                    .then((unsub) => {
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
            {businesses ? (
                <div>
                    <h2>Businesses</h2>
                    {businesses.map((business, i) => (
                        <div key={i}>
                            <BusinessComponent business={business} />
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
                            <OfferingComponent offering={offering} />
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
