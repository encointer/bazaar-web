import {ApiPromise, Keyring, WsProvider} from '@polkadot/api';
import {options, getBusinesses} from "@encointer/node-api";
import {communityIdentifierFromString} from "@encointer/util";
import {CommunityIdentifier} from '@encointer/types';

describe('node-api', () => {
    let keyring: Keyring;
    let api: any;
    const chain = 'wss://kusama.api.encointer.org';
    let leuCid: CommunityIdentifier;
    beforeAll(async () => {
        // jest.setTimeout(90000);
        keyring = new Keyring({type: 'sr25519'});
        const provider = new WsProvider(chain);
        try {
            // @ts-ignore
            api = await ApiPromise.create({
                ...options(),
                provider: provider
            });
            console.log(`${chain} wss connected success`);
        } catch (err) {
            console.log(`connect ${chain} failed`);
            await provider.disconnect();
        }

        leuCid = communityIdentifierFromString(api.registry, "u0qj944rhWE");
    }, 40000);
    afterAll(async () => {
        // Jest fails to exit after the tests without this.
        await api.disconnect();
    });

    describe('rpc', () => {
        it('communities.GetAll should return empty vec', async () => {
            // @ts-ignore
            const result = await api.rpc.encointer.getAllCommunities();
            expect(result.length).toBe(3);
        });
    });
    describe('bazaar', () => {
        it('bazaar.GetBusinesses should return 1 business', async () => {
            // @ts-ignore
            const result = await getBusinesses(api, leuCid);
            expect(result.length).toBe(1);
            console.log(result.toHuman());

            let business = api.createType("Business", {
                controller: "CcZpQp6RdZiHzuEqdyiQJqHUvJsN13QPY113UGyEQgeYeDn",
                businessData: {
                    url: "Qmb3mRYRK6nwf3MXULPRHAQHAfkGs38UJ7voXLPN9gngqa",
                    lastOid: 1
                }
            });
            expect(result.pop()!.toHuman()).toStrictEqual(business.toHuman());

        });
        it('bazaar.GetOfferings should return empty vec', async () => {
            // @ts-ignore
            const result = await api.rpc.encointer.bazaarGetOfferings(leuCid);
            expect(result.length).toBe(0);
        });
        it('bazaar.GetOfferingsForBusiness should return empty vec', async () => {
            const alice = keyring.addFromUri('//Alice', {
                name: 'Alice default'
            });

            const bid = api.createType('BusinessIdentifier', [leuCid, alice.publicKey]);

            // @ts-ignore
            const result = await api.rpc.encointer.bazaarGetOfferingsForBusiness(bid);
            expect(result.length).toBe(0);
        });
    });
});
