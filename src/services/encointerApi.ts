import {options as encointerOptions} from "@encointer/node-api/options";
import {localChain, remoteChain} from "../settings";
import {CommunityDisplay, OfferingData} from "../Types";
import {decodeByteArrayString} from "../helpers";
import {getBusinesses} from "@encointer/node-api";
import {ApiPromise, WsProvider} from "@polkadot/api";
import {Business, CidName, CommunityIdentifier} from "@encointer/types";
import {communityIdentifierToString} from "@encointer/util";
import type { ApiOptions } from "@polkadot/api/types";
import type { ProviderInterface } from "@polkadot/rpc-provider/types";

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
        const apiOpts: ApiOptions = {
            provider: provider as ProviderInterface,
            // encointerOptions returns a set of ApiOptions-compatible fields (types, rpc, bundles, etc.)
            // We spread it into a concrete ApiOptions object.
            ...(encointerOptions() as Partial<ApiOptions>),
        };
        apiPromise = ApiPromise.create(apiOpts).catch(async (err) => {
            try {
                await provider.disconnect();
            } catch (_) {}
            apiPromise = null;
            throw err;
        });
    }
    return apiPromise;
}

export async function fetchAllCommunities(): Promise<CommunityDisplay[]> {
    const api = await getApi();

    // @ts-ignore
    const communitiesArray: CidName[] = await api.rpc.encointer.getAllCommunities();
    return communitiesArray.map((c) => ({
        cidDisplay: communityIdentifierToString(c.cid).toString(),
        cid: c.cid,
        name: decodeByteArrayString(c.name.toString()),
    }));
}

export async function fetchBusinessIpfsCids(cid: CommunityIdentifier): Promise<string[]> {
    const api = await getApi();
    try {
        // @ts-ignore
        const businessesList = await getBusinesses(api, cid);
        return (businessesList.length > 0)
            ? businessesList.map((business: Business) =>
                business.businessData.url.toHuman()
            )
            : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function fetchOfferingIpfsCids(cid: CommunityIdentifier): Promise<string[]> {
    const api = await getApi();
    try {
        // @ts-ignore
        const offeringsList = await api.rpc.encointer.bazaarGetOfferings(cid);
        return (offeringsList.length > 0)
            ? offeringsList.map((e: OfferingData) => e.url.toString())
            : [];
    } catch (e) {
        console.error(e);
        return [];
    }
}
