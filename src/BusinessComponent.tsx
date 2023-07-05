import { Business } from "./Types";
import { resolveIpfs } from "./ipfs";

export function BusinessComponent(props: { business: Business }) {
    console.log(props.business)
    return (
        <ul>
            <li>
                Name: {props.business.name}
                <p> Description: {props.business.description} </p>
            </li>
            <img
                alt="business icon"
                style= {{width: "30vw"}}
                src={resolveIpfs(props.business["logo"])}
            />
        </ul>
    );
}
