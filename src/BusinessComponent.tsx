import React from "react";
import {Business} from "./Types";

export function BusinessComponent(props: { business: Business }) {
    return <ul>
        <li>
            Name: {props.business.name}
            <p> Description: {props.business.description} </p>
        </li>
    </ul>;
}