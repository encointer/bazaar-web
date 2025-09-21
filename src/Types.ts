export interface BusinessDisplay {
    name: string,
    description: string,
    logo: string,
}

// Nominal type for clarity and safety
export type CidDisplay = string;

export interface CommunityDisplay {
    name: string,
    cid: CidDisplay,
}

export interface ItemOffered {
    name: string,
	description: string,
	category: string,
	image: string,
	itemCondition: string
}

export interface Offering {
    price: number,
    community: string,
    itemOffered: ItemOffered,
}

export interface OfferingData {
    url: string,
}
