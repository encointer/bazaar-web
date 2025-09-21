import React from "react";
import {CommunityDisplay, CidDisplay} from "../Types";

type Props = {
    communities: CommunityDisplay[];
    value: CidDisplay | "";
    onChange: (cid: CidDisplay | "") => void;
};

export const CommunitySelect: React.FC<Props> = ({ communities, value, onChange }) => {
    return (
        <div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as CidDisplay)}
            >
                <option value="" disabled>choose a community</option>
                {communities.map((community, i) => (
                    <option key={i} value={community.cidDisplay}>
                        {community.name}
                    </option>
                ))}
            </select>
        </div>
    );
};
