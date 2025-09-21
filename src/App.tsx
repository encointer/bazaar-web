import {useEffect, useState} from "react";
import "./App.css";
import {BusinessComponent} from "./BusinessComponent";
import {OfferingComponent} from "./OfferingComponent";
// ... existing code removed: direct api usage, options, settings, helpers, ipfs
import {CidDisplay} from "./Types";
import {useCommunities} from "./hooks/useCommunities";
import {useCommunityData} from "./hooks/useCommunityData";
import {CommunitySelect} from "./components/CommunitySelect";

function App() {
    const {communities, loading: communitiesLoading, error: communitiesError} = useCommunities();
    const [selectedCid, setSelectedCid] = useState<CidDisplay | "">("");

    const {businesses, offerings, loading: dataLoading, error: dataError} =
        useCommunityData(selectedCid || undefined);

    // Optional: reload when selectedCid changes is handled inside hook,
    // this effect is not needed unless you want side-effects here.
    useEffect(() => {
    }, [selectedCid]);

    return (
        <div className="App">
            <h1>Businesses And Offerings Per Community</h1>

            {communitiesError && <div>Error loading communities: {String(communitiesError)}</div>}
            {communitiesLoading && <div>Loading communities...</div>}

            {!communitiesLoading && (
                <CommunitySelect
                    communities={communities}
                    value={selectedCid}
                    onChange={setSelectedCid}
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
