import {ApiPromise, Keyring, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";
import { communityIdentifierFromString } from "@encointer/util/cidUtil.js";

describe('node-api', () => {
  let keyring: Keyring;
  let api: any;
  const chain = 'ws://127.0.0.1:9944';
  beforeAll(async () => {
    // jest.setTimeout(90000);
    keyring = new Keyring({ type: 'sr25519' });
    const provider = new WsProvider('ws://127.0.0.1:9944');
    try {
      api = await ApiPromise.create({
        ...options(),
        provider: provider
      });
      console.log(`${chain} wss connected success`);
    } catch (err) {
      console.log(`connect ${chain} failed`);
      await provider.disconnect();
    }
  }, 40000);
  afterAll(async () => {
    // Jest fails to exit after the tests without this.
    await api.disconnect();
  });

  describe('rpc', () => {
    it('communities.GetAll should return empty vec', async () => {
      const result = await api.rpc.communities.getAll();
      // console.log(result);
      expect(result.length).toBe(0);
    });
    it('communities.getLocations should return error on unknown community', async () => {
      let cid = communityIdentifierFromString(api.registry, "gbsuv7YXq9G");

      try {
        // @ts-ignore
        await api.rpc.communities.getLocations(cid);
      } catch (e) {
        expect(e.toString()).toBe("Error: 3: Offchain storage not found: Key [99, 105, 100, 115, 103, 98, 115, 117, 118, 255, 255, 255, 255]");
      }
    });
  });
  describe('bazaar', () => {
    it('bazaar.GetBusinesses should return empty vec', async () => {
      const cid = api.createType('CommunityIdentifier', {
        geohash: [0x00, 0x00, 0x00, 0x00, 0x00],
        digest: [0x00, 0x00, 0x00, 0x00]
      }); // @ts-ignore

      const result = await api.rpc.bazaar.getBusinesses(cid.toHex()); // console.log(result);

      expect(result.length).toBe(0);
    });
    it('bazaar.GetOfferings should return empty vec', async () => {
      // random cid
      let cid = communityIdentifierFromString(api.registry, "gbsuv7YXq9G"); // @ts-ignore

      const result = await api.rpc.bazaar.getOfferings(cid); // console.log(result);

      expect(result.length).toBe(0);
    });
    it('bazaar.GetOfferingsForBusiness should return empty vec', async () => {
      // random cid
      let cid = communityIdentifierFromString(api.registry, "gbsuv7YXq9G");
      const alice = keyring.addFromUri('//Alice', {
        name: 'Alice default'
      });
      const bid = api.createType('BusinessIdentifier', [cid, alice.publicKey]); // @ts-ignore

      const result = await api.rpc.bazaar.getOfferingsForBusiness(bid); // console.log(result);

      expect(result.length).toBe(0);
    });
  });
});
