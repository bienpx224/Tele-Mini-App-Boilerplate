import { FC, useEffect, useState, useCallback, useRef } from 'react';

import React from 'react';

import { TonConnectButton, useTonAddress, useTonWallet, useTonConnectUI, SendTransactionRequest } from '@tonconnect/ui-react';

import TonWeb from 'tonweb';
import { TonClient,TonClientParameters, Address, beginCell, storeMessage, toNano, TonClient4 } from '@ton/ton'
import { Transaction } from '@ton/core';
import { useTonClient } from '../../hooks/useTonClient';


interface WaitForTransactionOptions {
  address: string;
  hash: string;
  refetchInterval?: number;
  refetchLimit?: number;
}

const TonSpace: FC = () => {

  const gameRef = useRef<any>(null);
  //#region Ton Connect
  const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', { apiKey: 'e392ccf86b584171cd4601d393cb4d0d73955f58377e4be0c1c12a7cbd95e954' }));
  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);
  const wallet = useTonWallet();
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const { client } = useTonClient();

  const receiveAddress = "0QDFld903Qfvm_ImFNoB05W3tyDX2R6fGd2weTUnL8HL69uo";  // TON wallet address in bien.pham chrome.


  const getCurrentDateTime = () => {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24h format
    });
    return formattedDateTime;
  }
  const handleTonSendTransaction2 = async () => {
    console.log("====== Start transaction 2 === ")
    const body = beginCell()
      .storeUint(0xf8a7ea5, 32)
      .storeUint(0, 64)
      .storeCoins(5000000)
      .storeAddress(
        Address.parse(receiveAddress)
      )
      .storeAddress(
        Address.parse(receiveAddress)
      )
      .storeUint(0, 1)
      .storeCoins(1)
      .storeUint(0, 1)
      .endCell();

    const newTransaction = {
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: receiveAddress,
          amount: toNano(0.05).toString(),
          payload: body.toBoc().toString("base64"),
        },
      ],
    };

    // Serialize the transaction and calculate the hash
    const transactionCell = beginCell()
      .storeAddress(Address.parse(receiveAddress))
      .storeCoins(toNano(0.05))
      .storeRef(body)
      .endCell();

    console.log("transactionCell : ", transactionCell);

    const transactionHashBuffer = transactionCell.hash(); // This gives you the buffer of the hash
    console.log("transactionHashBuffer : ", transactionHashBuffer)
    const transactionHashBase64 = TonWeb.utils.bytesToBase64(transactionHashBuffer); // Convert the hash buffer to base64
    console.log("transactionHashBase64 : ", transactionHashBase64)

    // Set the transaction and pass it to the callback
    const transactionWithHash = { ...newTransaction, hash: transactionHashBase64 };
    console.log("transactionWithHash : ", transactionWithHash);

    const result = await tonConnectUI.sendTransaction(newTransaction);

    // Nếu transaction thành công
    console.log('Transaction sent successfully:', result);

    try {
      // Check it deserialized correctly
      const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(result.boc)).hash();
      console.log("BOC CELL BYTES : ", bocCellBytes);
      const hashBase64 = TonWeb.utils.bytesToBase64(bocCellBytes);
      console.log(hashBase64);

      // const findTx = await tonweb.provider.getTransactions(userFriendlyAddress, 1, 0, hashBase64);
      // console.log("=== Find this TX : ");
      // console.log(findTx)

      // const findTx = await tonweb.getTransactions(userFriendlyAddress, 1, 0, hashBase64);
      // console.log("=== Find this TX : ");
      // console.log(findTx)
    } catch (error) {
      console.error("=== Decode Boc error : ", error)
    }


  }
  const handleTonSendTransaction = async () => {
    let msgString = "Brian tx at " + getCurrentDateTime();
    console.log("=== TON send tx with msg : " + msgString);
    let msg = new TonWeb.boc.Cell();
    msg.bits.writeUint(0, 32);
    msg.bits.writeString(msgString);
    let payload = TonWeb.utils.bytesToBase64(await msg.toBoc());
    let amount = toNano(0.05).toString();
    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
      messages: [
        {
          address: receiveAddress, // my ton wallet in bienpx224 chrome 
          amount: amount, // = 0.05 TON ,  1 TON = 1*10^9 nanoton
          payload: payload,
        },
      ],
    }
    try {
      const result = await tonConnectUI.sendTransaction(transaction);

      // Nếu transaction thành công
      console.log('Transaction sent successfully:', result);

      // you can use signed boc to find the transaction 
      let hashBase64;
      try {
        // Check it deserialized correctly
        const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(result.boc)).hash();
        hashBase64 = TonWeb.utils.bytesToBase64(bocCellBytes);
        console.log(hashBase64);

      } catch (error) {
        console.error("=== Decode Boc error : ", error)
      }

      // const findTx = await tonweb.provider.getTransactions(userFriendlyAddress, 1, 0, hashBase64);
      // console.log("=== Find this TX : ");
      // console.log(findTx)

      try{
      // Using tonweb to get transactions
      // const lastTxs = await tonweb.getTransactions(userFriendlyAddress, 3, undefined, hashBase64);

      // Using ton-core TonClient to get transaction 
      if(client == undefined){
        console.log("Ton Client is undefined, so return;")
        return;
      }
      const lastTxs = await client.getTransactions(Address.parse(receiveAddress), {limit: 3, hash : hashBase64}) as Transaction[];
      console.log("Last Txs : " , lastTxs)
      
      for (let i = 0; i <= lastTxs.length - 1 ; i ++ ) {
        let lastTx : Transaction;
        lastTx = lastTxs[i];
        console.log("getTransactions : ", lastTx)
        const txDescription = lastTx.description;
        console.log("this tx description : ", txDescription)
        // if (txDescription.type !== 'generic' || txDescription.computePhase.type !== 'vm') {
        //   console.log(txDescription);
        //   continue;
        // }
        if (lastTx && lastTx.inMessage) {
          const msgCell = beginCell().store(storeMessage(lastTx.inMessage)).endCell();
          const inMsgHash = msgCell.hash().toString("base64");

          if (inMsgHash === hashBase64) {
            console.log("======= This is our transaction =======");
          }
        }
      }
      }catch(e){

      }

    } catch (error) {
      // Nếu có lỗi hoặc người dùng cancel transaction
      console.error('Transaction failed or cancelled:', error);
    }
  }
  //#endregion

  //#region  Render HTML
  return (
    <div className="box-game" ref={gameRef}>

      <div className="box-game__conent-game" style={{ backgroundColor: "grey" }}>
        <div className="hud-button">

          <TonConnectButton />
          {/* <button onClick={doPostLogin}>Login</button> */}
          {/* <button>{platformCompress}</button> */}
          {/* <h3>Configure and send transaction</h3>
          <ReactJson src={defaultTx} theme="ocean" onEdit={onChange} onAdd={onChange} onDelete={onChange} /> */}
          {userFriendlyAddress && (
            <div>
              <span>User-friendly address: {userFriendlyAddress}</span><br></br>
              {/* <span>Raw address: {rawAddress}</span> */}

              <button onClick={handleTonSendTransaction}>
                Send transaction
              </button>
              <button onClick={handleTonSendTransaction2}>
                Send transaction2
              </button>
            </div>

          )
          }
          {/* {wallet && (
            <div>
              <span>Connected wallet: {wallet?.account.address}</span>
              <span>Device: {wallet?.device.appName}</span>
            </div>
          )
          } */}
        </div>
      </div>

    </div>
  );

  //#endregion
};

export default TonSpace;
