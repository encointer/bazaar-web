import {ApiPromise, Keyring, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";
import { communityIdentifierFromString } from "@encointer/util/cidUtil.js";
import { CommunityIdentifier } from '@encointer/types';

describe('node-api', () => {
  let keyring: Keyring;
  let api: any;
  const chain = 'wss://kusama.api.encointer.org';
  let testCid: CommunityIdentifier;
  beforeAll(async () => {
    // jest.setTimeout(90000);
    keyring = new Keyring({ type: 'sr25519' });
    const provider = new WsProvider(chain);
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

    testCid = communityIdentifierFromString(api.registry, "gbsuv7YXq9G");
  }, 40000);
  afterAll(async () => {
    // Jest fails to exit after the tests without this.
    await api.disconnect();
  });

  describe('rpc', () => {
    it('communities.GetAll should return empty vec', async () => {
      // @ts-ignore
      const result = await api.rpc.encointer.getAllCommunities();
      expect(result.length).toBe(0);
    });
    it('communities.getLocations should return error on unknown community', async () => {
      try {
        // @ts-ignore
        await api.rpc.encointer.getLocations(testCid);
      } catch (e) {
        expect(e.toString()).toBe("RpcError: 3: Offchain storage not found: [99, 105, 100, 115, 103, 98, 115, 117, 118, 255, 255, 255, 255]");
      }
    });
  });
  describe('bazaar', () => {
    it('bazaar.GetBusinesses should return empty vec', async () => {
      // @ts-ignore
      const result = await api.rpc.encointer.bazaarGetBusinesses(testCid.toHex());
      expect(result.length).toBe(0);
    });
    it('bazaar.GetOfferings should return empty vec', async () => {
      // @ts-ignore
      const result = await api.rpc.encointer.bazaarGetOfferings(testCid);
      expect(result.length).toBe(0);
    });
    it('bazaar.GetOfferingsForBusiness should return empty vec', async () => {
      const alice = keyring.addFromUri('//Alice', {
        name: 'Alice default'
      });

      const bid = api.createType('BusinessIdentifier', [testCid, alice.publicKey]);

      // @ts-ignore
      const result = await api.rpc.encointer.bazaarGetOfferingsForBusiness(bid);
      expect(result.length).toBe(0);
    });
  });
});
