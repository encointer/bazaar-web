import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";

const IPFS = require('ipfs-core');

interface BusinessData {
  url: string;
  oid: number;
}

// interface Business {
//   name: string;
//   description: string;
// }

// interface OfferingData {
//   url: string;
//   oid: number;
// }

function App() {
  const [businesses, setBusinesses] = useState<BusinessData[]>();
  // const [communities, setCommunities] = useState();
  let api: any;

  const connect = async () => {
    // let api: ApiPromise;
    const chain = 'ws://127.0.0.1:9944';
    const provider = new WsProvider('ws://127.0.0.1:9944');
    try {
      api = await ApiPromise.create({
          ...options(),
          provider: provider
      });
      console.log(`${chain} wss connected success`);
      return true;
    } 
    catch (err) {
      console.log(`connect ${chain} failed`);
      await provider.disconnect();
    }
  }

  connect();

  const getBusinesses = async () => {
    if(await connect()) {
      // const communities = await api.rpc.communities.getAll();
      // console.log("communities get all returns type:", typeof result);
      // console.log(communities);
      // const bid = api.createType('BusinessIdentifier', {});
      const businesses = await api.rpc.bazaar.getBusinesses("0xa7c3c66819ea4962f65b0a9525017e43adc662096482313f31dd08eb0a7aa53f");
      // console.log("businesses get all returns type:", typeof businesses);
      setBusinesses(businesses);
      // setCommunities(communities);
      // Object.keys(businesses).map((key, i) => (
      console.log("businesses: --- ", businesses);
      
      const ipfs = await IPFS.create();

      let businessUrls: string[] = [];
      
      //TO-DO: I get an array of Maps with key url and key oid. for now, i take every element, and push the url to a list

      // console.log("businesses[0]['url']: --- ", businesses[0]['url']);
      let exampleJsons = [];
      if(businesses.length > 0) {
        businessUrls = businesses.map((e: BusinessData) => e['url']);
        businessUrls.forEach(e => 
          exampleJsons.push(ipfs.get(e)));
        // jsonExample =  ipfs.get(busi)
      }
      // console.log("type of businesses:",typeof businesses);
  }
}
  useEffect(() => {
    let unsubscribeAll: any = null;
    getBusinesses()
      .then(unsub => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);
      return () => unsubscribeAll && unsubscribeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <h1>Businesses</h1>
        
        {businesses ? ( 
        <div>
          {/* {businesses} */}
          {/* {businesses[1]['url']} */}
          {
            // businesses.map((business) => ( Object.entries(business).map((value,key) => (
            //   <span>
            //   <p> 
            //     {key}
            //   </p>
            //   <p>
            //     {value}
            //   </p>
            //   </span>
            // ))))
          }

        </div>
        )
        : 
        (
          <div>businesses empty</div>
        )
        }
    </div>
  );
}

export default App;