import {useEffect, useState} from "react";
import {BusinessDisplay, CidDisplay, Offering} from "../Types";
import {fetchBusinessCids, fetchOfferingCids} from "../services/encointerApi";
import {loadJsonFromIpfs} from "../ipfs";

export function useCommunityData(cid?: CidDisplay) {
    const [businesses, setBusinesses] = useState<BusinessDisplay[]>([]);
    const [offerings, setOfferings] = useState<Offering[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    const load = async () => {
        if (!cid) {
            setBusinesses([]);
            setOfferings([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [businessCids, offeringCids] = await Promise.all([
                fetchBusinessCids(cid),
                fetchOfferingCids(cid),
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cid]);

    return { businesses, offerings, loading, error, reload: load };
}
