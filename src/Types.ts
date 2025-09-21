export interface BusinessData {
    url: string,
    oid: number,
}

export interface Business {
    name: string,
    description: string,
    logo: string,
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
