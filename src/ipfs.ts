import { IPFS_GATEWAY } from "./settings";

export const resolveIpfs = (cid: string) => {
    return `${IPFS_GATEWAY}/${cid}`;
};

export const loadJsonFromIpfs = async (cid: string) => {
    const res = await fetch(resolveIpfs(cid));
    if (res.ok) return res.json();
};
