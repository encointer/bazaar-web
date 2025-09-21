import {useEffect, useState} from "react";
import "./App.css";
import {BusinessComponent} from "./BusinessComponent";
import {OfferingComponent} from "./OfferingComponent";
import {CommunityDisplay, CidDisplay} from "./Types";
import {useCommunities} from "./hooks/useCommunities";
import {useCommunityData} from "./hooks/useCommunityData";
import {CommunitySelect} from "./components/CommunitySelect";

function App() {
    const { communities, loading: communitiesLoading, error: communitiesError } = useCommunities();
    const [selectedCommunity, setSelectedCommunity] = useState<CommunityDisplay | null>(null);

    const { businesses, offerings, loading: dataLoading, error: dataError } =
        useCommunityData(selectedCommunity ?? undefined);

    // Optional: reload when selectedCid changes is handled inside hook,
    // this effect is not needed unless you want side-effects here.
    useEffect(() => {
    }, [selectedCommunity]);

    return (
        <div className="App">
            <h1>Businesses And Offerings Per Community</h1>

            {communitiesError && <div>Error loading communities: {String(communitiesError)}</div>}
            {communitiesLoading && <div>Loading communities...</div>}

            {!communitiesLoading && (
                <CommunitySelect
                    communities={communities}
                    value={selectedCommunity?.cidDisplay ?? ""}
                    onChange={(cidDisp: CidDisplay | "") => {
                        if (cidDisp === "") {
                            setSelectedCommunity(null);
                        } else {
                            const found = communities.find(c => c.cidDisplay === cidDisp) || null;
                            setSelectedCommunity(found);
                        }
                    }}
                />
            )}

            {dataError && <div>Error loading data: {String(dataError)}</div>}
            {dataLoading && <div>Loading data...</div>}

            {businesses.length > 0 ? (
                <div>
                    <h2>Businesses</h2>
                    {businesses.map((business, i) => (
                        <div key={i}>
                            <BusinessComponent business={business}/>
                        </div>
                    ))}
                </div>
            ) : (
                <div>No businesses</div>
            )}

            {offerings.length > 0 ? (
                <div>
                    <h2>Offerings</h2>
                    {offerings.map((offering, i) => (
                        <div key={i}>
                            <OfferingComponent offering={offering}/>
                        </div>
                    ))}
                </div>
            ) : (
                <div>No offerings</div>
            )}
        </div>
    );
}

export default App;
