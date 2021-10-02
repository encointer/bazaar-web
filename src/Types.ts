export interface BusinessData {
    url: string,
    oid: number,
}

export interface Business {
    name: string,
    description: string,
    image_cid: string,
    image: string,
}

export interface Offering {
    name: string,
    price: number,
    community: string,
    image_cid: string,
    image: string,
}

export interface OfferingData {
    url: string,
}

export interface Community {
    name: string,
    cid: string,
}