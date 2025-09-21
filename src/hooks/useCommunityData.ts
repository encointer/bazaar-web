import {useEffect, useState} from "react";
import {BusinessDisplay, CommunityDisplay, Offering} from "../Types";
import {fetchBusinessIpfsCids, fetchOfferingIpfsCids} from "../services/encointerApi";
import {loadJsonFromIpfs} from "../ipfs";

export function useCommunityData(community?: CommunityDisplay) {
    const [businesses, setBusinesses] = useState<BusinessDisplay[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    const load = async () => {
        if (!community) {
            setBusinesses([]);
            setOfferings([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [businessCids, offeringCids] = await Promise.all([
                fetchBusinessIpfsCids(community!.cid),
                fetchOfferingIpfsCids(community!.cid),
            ]);

            const businessesData: BusinessDisplay[] = [];
            for (const bcid of businessCids) {
                const business = await loadJsonFromIpfs(bcid);
                businessesData.push(business);
            }

            const offeringsData: Offering[] = [];
            for (const ocid of offeringCids) {
                const res = await loadJsonFromIpfs(ocid);
                res.itemOffered = await loadJsonFromIpfs(res.itemOffered);
                offeringsData.push(res);
            }

            setBusinesses(businessesData);
            setOfferings(offeringsData);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (cancelled) return;
            await load();
        })();
        return () => { cancelled = true; };
    }, [community]);

    return { businesses, offerings, loading, error, reload: load };
}
