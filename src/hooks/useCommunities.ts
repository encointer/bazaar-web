import {useEffect, useState} from "react";
import {CommunityDisplay} from "../Types";
import {fetchAllCommunities} from "../services/encointerApi";

export function useCommunities() {
    const [communities, setCommunities] = useState<CommunityDisplay[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchAllCommunities()
            .then((comms) => {
                if (!cancelled) setCommunities(comms);
            })
            .catch((err) => {
                if (!cancelled) setError(err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    return { communities, loading, error };
}
