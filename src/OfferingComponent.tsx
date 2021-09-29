import {Offering} from "./Types";
import React from "react";

export function OfferingComponent(props: { offering: Offering }) {
    return <ul>
        <li>
            <p> name: {props.offering.name} </p>
            <p> price: {props.offering.price} </p>
            <p> community: {props.offering.community} </p>
        </li>
    </ul>;
}