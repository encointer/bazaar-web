import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';

import {ApiPromise, WsProvider} from '@polkadot/api';
import {options} from "@encointer/node-api/options";
// import IPFS from "ipfs-http-client";
// import { Grid, Form, Dropdown } from 'semantic-ui-react';

// const IPFS = require('ipfs-core');
// const IPFSAPI = require('ipfs-http-client');

// const all = require('it-all');
// const { concat: uint8ArrayConcat } = require('uint8arrays/concat');

interface BusinessData {
  url: string;
  oid: number;
}

interface Business {
  name: string;
  description: string;
}

// interface OfferingData {
//   url: string;
//   oid: number;
// }

// businessCid1 = QmXGsZKHxMhaP8a2PCHPb4vtZJ1trLyChmQdu2oWCG9eDP;
// businessCid2 = QmS7YPfCBfjqMux5AYd5VaYjHG8tEcvzShEBNpHtXT8t5y;

function App() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [communities, setCommunities] = useState([]);
  let api: any;

  const catBusinessInfoFromInfura = async (businessCids: string[]) => {
    const ipfsClient = require('ipfs-http-client')
    const client = ipfsClient.create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
      }
    })

    businessCids.forEach((cid: string) => {
      let stream = client.cat(cid);
      getChunks(stream);
    });
    // let stream = client.cat('QmXGsZKHxMhaP8a2PCHPb4vtZJ1trLyChmQdu2oWCG9eDP');

    async function getChunks(stream: []) {
      let ar: any = [];
      for await (let chunk of stream) {
        // console.log(uint8arrayToStringMethod(chunk));
        ar.push(chunk)
      }
      let businessDataString = uint8arrayToStringMethod(ar[0]);
      let businessData: Business = JSON.parse(businessDataString);
      // console.log("businessDataString:", businessDataString);
      console.log("businessData:", businessData);
      setBusinesses(oldArray => [...oldArray, businessData]);
    }

    function uint8arrayToStringMethod(myUint8Arr: []){
      return String.fromCharCode.apply(null, myUint8Arr);
    }
  }

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

  const onCommunityChange = (communities: []) => {
    setCommunities(communities);
  }


  useEffect(() => {
    console.log("state of communities is: ", communities);
  }, [communities]);

  useEffect(() => {
    console.log("state of businesses is: ", businesses);
  }, [businesses]);


  const getBusinesses = async () => {
    if(await connect()) {

      const communitiesArray = await api.rpc.communities.getAll();
      onCommunityChange(communitiesArray);

      //here we later wont take it like that but pass the actual wanted community
      const businessesList = await api.rpc.bazaar.getBusinesses(communitiesArray[0]['cid'].toString());
      // onBusinessChange(businessesList);

      let businessUrls: string[];

      // let exampleJsons: any[] = [];
      if(businessesList.length > 0) {
        businessUrls = businessesList.map((e: BusinessData) => e['url'].toString());
        return businessUrls;
      }
  }
}

  useEffect(() => {
    let unsubscribeAll: any = null;
    getBusinesses().then(buisness_cids => {
      if(buisness_cids) {
        catBusinessInfoFromInfura(buisness_cids);
      }
    })
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
      {/*<Form>*/}
        {/*<DropDown>*/}

        {/*</DropDown>*/}
      {/*</Form>*/}
        {businesses ? (
        <div>
          {
            // businesses.map((business) => ( Object.entries(business).map((value,key) => (
            //   <span>
            //   {/*<p>*/}
            //   {/*  {key}*/}
            //   {/*</p>*/}
            //   <p>
            //     {value}
            //   </p>
            //   </span>
            // ))))

            businesses.map((business) => (
                <span>
                  <p key="{name}">rung
                    Name: {business.name}
                  </p>
                  <p key="{description}">
                    Description: {business.description}
                  </p>
                </span>
            ))
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