import {ApiPromise, WsProvider} from "@polkadot/api";
import {options} from "@encointer/node-api/options";
import {localChain, remoteChain} from "../settings";
import {BusinessData, Community, CommunityIdentifier, OfferingData} from "../Types";
import {decodeByteArrayString} from "../helpers";

let apiPromise: Promise<ApiPromise> | null = null;

function getChainWsUrl(): string {
    if (process.env['REACT_APP_LOCAL'] === "enabled") {
        return localChain;
    } else if (process.env['REACT_APP_LOCAL_CHAIN_REMOTE_IPFS'] === "enabled") {
        return localChain;
    } else {
        return remoteChain;
    }
}

async function getApi(): Promise<ApiPromise> {
    if (!apiPromise) {
        const provider = new WsProvider(getChainWsUrl());
        // @ts-ignore
        apiPromise = ApiPromise.create({
            ...options(),
            provider,
        }).catch(async (err) => {
            try {
                await provider.disconnect();
            } catch (_) {}
            apiPromise = null;
            throw err;
        });
    }
    return apiPromise;
}

export async function fetchAllCommunities(): Promise<Community[]> {
    const api = await getApi();
    const communitiesArray: Community[] = await api.rpc.encointer.getAllCommunities();
    return communitiesArray.map((c) => ({
        ...c,
        name: decodeByteArrayString(c.name),
    }));
}

export async function fetchBusinessCids(cid: CommunityIdentifier): Promise<string[]> {
    const api = await getApi();
    try {
        const businessesList = await api.rpc.encointer.bazaarGetBusinesses(cid);
        return (businessesList.length > 0)
            ? businessesList.map((e: BusinessData) => e.url.toString())
            : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function fetchOfferingCids(cid: CommunityIdentifier): Promise<string[]> {
    const api = await getApi();
    try {
        const offeringsList = await api.rpc.encointer.bazaarGetOfferings(cid);
        return (offeringsList.length > 0)
            ? offeringsList.map((e: OfferingData) => e.url.toString())
            : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
