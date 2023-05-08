import { Offering } from "./Types";
import { resolveIpfs } from "./ipfs";

export function OfferingComponent(props: { offering: Offering }) {

    return (
        <ul>
            <li>
                <p> name: {props.offering.itemOffered.name} </p>
                <p> description: {props.offering.itemOffered.description} </p>
                <p> category: {props.offering.itemOffered.category} </p>
                <p>
                    {" "}
                    itemCondition: {
                        props.offering.itemOffered.itemCondition
                    }{" "}
                </p>
                <p> price: {props.offering.price} </p>
                <p> community: {props.offering.community} </p>
                <img
                    alt="offering icon"
                    style= {{width: "30vw"}}
                    src={resolveIpfs(props.offering.itemOffered.image)}
                />
            </li>
        </ul>
    );
}
