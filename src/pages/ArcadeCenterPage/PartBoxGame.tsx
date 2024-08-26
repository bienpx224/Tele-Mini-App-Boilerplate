import { FC, useEffect, useState, useRef } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import React from 'react';
import config from '../../config';
import WebApp from '@twa-dev/sdk'
import { Invoice, InvoiceStatus, initInvoice } from '@tma.js/sdk';
import { postLogin, cancelBattle } from '../api/game.api';
import { ILoginUserData, ITelegramUser } from './TelegramType';
import InternetLoading from './InternetLoading';
import GameLoading from './GameLoading';
import copyToClipboard from 'copy-to-clipboard';
import TonWeb from 'tonweb';
import { toNano } from '@ton/ton';
import { useTonAddress, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import axios from 'axios';



const PartBoxGame: FC = () => {
  const [isShowGame, setIsShowGame] = useState<boolean>(false); // game loaded and ready to show
  const [telegramUser, setTelegramUser] = useState<ITelegramUser | null>(null);
  const [loginUser, setLoginUser] = useState<ILoginUserData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [platform, setPlatform] = useState<string>("");
  const timeDelayLoadingToGame: number = 2;

  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/windows phone/i.test(userAgent)) {
      return "ios";
      return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
      return "android";
      return "Android";
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return "ios";
      return "iOS";
    }

    if (/Macintosh/i.test(userAgent)) {
      return "ios";
      return "Mac";
    }

    if (/Windows NT/i.test(userAgent)) {
      return "pc";
      return "Windows PC";
    }

    return "ios";
    return "Unknown";
  }

  //#region Define for Interact Unity vs React
  const AccessTokenKey = "accessToken"
  const AccessTokenExpireAtKey = "accessTokenExpireAt"
  const GameObjectWebInteractInGame = "=== UserDataManager"

  /* Event Game call to Web */
  const UnityEventNameSayHi = "UnitySayHelloToWeb";
  const UnityEventShopBuyProduct = "GameClickedBuyProduct";
  const UnityEventGameRequestLogin = "GameRequestLogin";
  const UnityEventSetClipboard = "GameSetClipboard";
  const UnityEventGameVibrate = "GameVibrate";
  const UnityEventGameRequestTonDisconnect = "GameRequestTonDisconnect";

  /* Event Web call to Game */
  const UnityFuncWebLoginAndPassToken = "WebLoginAndPassToken";
  const UnityFuncWebSayHi = "WebSayHelloToUnity";
  const UnityFuncResultBuyProduct = "ResultBuyProductViaStar";
  const UnityFuncWebPassTelegramPlatform = "WebPassTelegramPlatform";
  const UnityFuncWebSentTonProcess = "WebSentTonProcess";
  const UnityFuncWebSentTonProcessComplete = "WebSentTonProcessComplete";
  const UnityFuncWebSentTonConnected = "WebSentTonConnected";

  //#endregion

  const versionBuild = config.game_build_version;
  let platformCompress = "pc";
  platformCompress = detectPlatform();
  platformCompress = "tele";
  // console.log("============== DETECT PLATFORM : " + platformCompress)
  const env = import.meta.env.VITE_APP_ENV || 'dev';
  const versionGameBuildFolder = `game_build_${env}`;
  const sourceGameFolder = `${platformCompress}_${versionBuild}`;
  const sourceGameName = `${platformCompress}_${versionBuild}`;
  const productName = "Jouney of Ages";

  const { unityProvider, isLoaded, loadingProgression, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: `/${versionGameBuildFolder}/${sourceGameName}/Build/${sourceGameName}.loader.js`,
    dataUrl: `/${versionGameBuildFolder}/${sourceGameName}/Build/${sourceGameName}.data.unityweb`,
    frameworkUrl: `/${versionGameBuildFolder}/${sourceGameName}/Build/${sourceGameName}.framework.js.unityweb`,
    codeUrl: `/${versionGameBuildFolder}/${sourceGameName}/Build/${sourceGameName}.wasm.unityweb`,
    companyName: productName,
    productName: productName,
    productVersion: versionBuild,
    cacheControl: handleCacheControl,
    streamingAssetsUrl: `/${versionGameBuildFolder}/${sourceGameName}/StreamingAssets`,
  });

  /* Thực hiện việc cache bản build Unity. */
  function handleCacheControl(url: string) {
    // return "immutable";
    if (url.match(/\.data/) || url.match(/\.bundle/)) {
      return "no-store";
      return "must-revalidate";
    }
    if (url.match(/\.mp4/) || url.match(/\.wav/)) {
      return "immutable";
    }
    return "no-store";
  }

  const gameRef = useRef<any>(null);

  let loadingPercentage = Math.round(loadingProgression * 100);



  useEffect(() => {
    if (!isLoaded) return;

    if (!isShowGame) {
      // console.log("--- Da load xong game, now wait 2s ...");
      const timer1 = setTimeout(() => {
        // console.log("--- Loaded game and wait 2s complete. Show Game now");
        setIsShowGame(true);
      }, timeDelayLoadingToGame * 1000);

      return () => {
        clearTimeout(timer1);
      };
    }
  }, [isLoaded]);

  /* When this Web App complete load */
  useEffect(() => {
    checkTelegramUser()
    // WebApp.enableClosingConfirmation()
    WebApp.onEvent("invoiceClosed", (params) => {
      console.log("- Event invoice Closed : ", params)
    })
    WebApp.expand();

  }, [WebApp])

  /* When telegram user data loaded and game instance ready */
  useEffect(() => {
    if (telegramUser && isShowGame) {
      console.log("- Already exist Telegram User and Showed game : Now wait 2s and Do Login...")
      const timerLogin = setTimeout(() => {
        /* Comment lại, lắng nghe event từ Game bắn ra thì call login */
        // doPostLogin()
      }, 2000);
      return () => {
        clearTimeout(timerLogin);
      };
    }
  }, [telegramUser, isShowGame])


  //#region Quit Web App Event
  const [isVisible, setIsVisible] = React.useState(!document.hidden);

  useEffect(() => {
    /* Check TMA open in mobile or web via window, navigator */
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      setIsMobile(true);
    }
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setIsMobile(true);
    }

    /* Check TMA open in mobile or web via Init Data in Telegram */
    if (platform != "weba") {
      setIsMobile(true)
    }


    const handleVisibilityChange = () => {
      if (document.hidden === true) {
        console.log("--- Closed App Document hidden : If is mobile")
        if (isMobile) {
          console.log("=== Is Mobile : So call API before close app")
          doNotifyClosedApp()
        } else {
          console.log("=== NOT Mobile : Do nothing")
          // doNotifyClosedApp()
        }
        // WebApp.close()
      }
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("unload", function () {
      console.log("----- called last, extra >>");
      // doNotifyClosedApp()
    });

    return () => {
      console.log("- remove event visiblity change ")
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  //#endregion


  //#region TMA - API Interact

  const doNotifyClosedApp = async () => {

    var aToken = localStorage.getItem(AccessTokenKey);
    console.log("--- Call API login for userid : " + loginUser?.id + " , username : " + telegramUser?.username + " , with accessToken : " + aToken)

    // Use navigator.sendBeacon for reliable data sending
    var url = "https://dev.coin-master-game.sotatek.works/dev/api/coin-master/battle/cancel";
    var data = null
    // if (navigator.sendBeacon) {
    //   console.log("--- call api cancel battle via send Beacon")
    //   navigator.sendBeacon(url, data);
    // } else {
    console.log("--- call api cancel battle via send FETCH")
    // Fallback to fetch if sendBeacon is not supported
    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aToken}`,
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: data,
    }).catch((error) => console.error('API call failed:', error));
    // }
    return;

    if (aToken !== "" && aToken !== null) {
      cancelBattle(aToken);
    } else {
      console.log("--- Not exist access Token, don't call cancel battle")
    }
  }

  const checkTelegramUser = () => {
    if (WebApp && WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
      console.log("- Exist user data : This opened via Telegram.")
      // console.log("- Webapp Data : ", WebApp.initData)
      console.log("- Webapp Data Platform: ", WebApp.platform)
      // console.log("- Webapp Data Unsafe : ", WebApp.initDataUnsafe)

      const tgWebAppPlatform = WebApp.platform;
      console.log("=== webAppPlatform : " + tgWebAppPlatform)
      setPlatform(tgWebAppPlatform);

      setTelegramUser(WebApp.initDataUnsafe.user as ITelegramUser)
    } else {
      console.log("= Not Exist Telegram user data : Create default test acc info")
      // setTelegramUser({id: 123456,
      //   first_name: "Default",
      //   last_name: "Test Acc",
      //   username: "default_test_acc",
      //   language_code: "en"})
    }
  }
  const doPostLogin = async () => {
    if (telegramUser) {
      let data = {
        "userId": telegramUser.id.toString(),
        "first_name": telegramUser.first_name,
        "last_name": telegramUser.last_name,
        "username": telegramUser.username,
        "tgWebAppData": WebApp.initData
      }
      console.log("--- Call API login for userid : " + telegramUser.id + " , username : " + telegramUser.username)
      const result = await postLogin(data);
      console.log("--- Result Login Post : ", result);
      if (result) {
        if ((result.statusCode == "201" || result.statusCode == "ok") && result.data) {
          const userData: ILoginUserData = {
            id: telegramUser.id,
            accessToken: result.data?.accessToken,
            accessTokenExpireAt: result.data?.accessTokenExpireAt
          };
          localStorage.setItem(AccessTokenKey, userData.accessToken)
          setLoginUser(userData);

          handlePassLoginToGame(telegramUser.id.toString(), userData?.accessToken, userData?.accessTokenExpireAt.toString())
        } else {
          console.log("--- Login Failed : Show popup and close. ")
          var msg = result?.data?.message;
          WebApp.showPopup({
            title: "Unable to authenticate user", // Optional
            message: msg,
            buttons: [{ type: "destructive", text: "Close" }], // Optional
          }, () => {
            WebApp.close();
          })
        }
      } else {
        console.log("--- Login Failed : Show popup and close. ")
        var msgFailed = "Login failed. Try again !";
        WebApp.showAlert(msgFailed, () => {
          WebApp.close();
        })
      }
    } else {
      console.log("--- Not exist telegram user, don't call Post login")

    }
  }
  //#endregion

  //#region Web and Unity Interact 
  function handleInteractUnitySayHi() {
    console.log("=== Web Interact to Unity")
    sendMessage(GameObjectWebInteractInGame, UnityFuncWebSayHi, "Hi~ I'm web client");
  }
  function handlePassLoginToGame(userId: string, accessToken: string, accessTokenExpireAt: string) {
    console.log("- Web pass authen to Game ")
    // var authen = `${userId}|${accessToken}|${accessTokenExpireAt}`;
    var authen = {
      "userId": userId,
      "accessToken": accessToken,
      "accessTokenExpireAt": accessTokenExpireAt
    }
    sendMessage(GameObjectWebInteractInGame, UnityFuncWebLoginAndPassToken, JSON.stringify(authen))
  }

  const handleUnityEvent = (data: any) => {
    console.log("Handle Unity Event : ", data)
  }

  /* data format : {"id":"","title":"","description":"","payload":"","base_amount":0,"amount":25,"priceStar":50,"priceUsd":0,"telegramLink":"https://t.me/$ZAkPWjC1gVQpAgAAvrgbGq7QHlc"} */
  const handleUnityEventShopBuyProduct = (data: any) => {
    console.log("Handle Unity Event Shop Buy Product: ", data)
    var dataJson = JSON.parse(data)
    console.log(dataJson.telegramLink)
    if (dataJson.currency == "XTR") {
      handleBuyProductByStar(dataJson)
    } else if (dataJson.currency == "TON") {
      handleBuyProductByTon(dataJson)
    } else {
      handleBuyProductByStar(dataJson)
    }
  }
  const handleUnityEventGameRequestLogin = (data: any) => {
    console.log("- Handle UnityEventGameRequestLogin");
    doPostLogin();
    sendUnityFuncWebPassTelegramPlatform();
    sendUnityFuncWebSentTonConnected(userFriendlyAddress)
  }
  const handleUnityEventGameVibrate = () => {
    console.log("=== Handle UnityEventGameVibrate")
    // Kiểm tra nếu trình duyệt hỗ trợ API Vibration
    if ("vibrate" in navigator) {
      console.log("===== Vibrate enable")
      // Rung điện thoại trong 200ms
      navigator.vibrate(200);
    } else {
      console.log("===== Vibrate disable")
    }

  }
  const handleUnityEventSetClipboard = (data: any) => {
    console.log("- Handle UnityEventSetClipboard : ", data);
    setClipboard(data);
  }
  const handleUnityEventGameRequestTonDisconnect = (address: any) => {
    console.log("- handleUnityEventGameRequestTonDisconnect")
    if (tonConnectUI.connected) {
      tonConnectUI.disconnect()
    }
  }
  const setClipboard = async (data: any) => {
    try {

      copyToClipboard(data || "", { debug: true, message: 'Press to copy' });
      WebApp.showAlert('Copied to clipboard successfully!');
      return;

      if (platform == "weba") {
        const permission = await navigator.permissions.query({ name: "clipboard-write" as PermissionName });
        if (permission.state === "granted" || permission.state === "prompt") {
          navigator.clipboard.writeText(data);
        } else {
          WebApp.showAlert("Permission clipboard not granted in browser!");
        }
      } else {
        navigator.clipboard.writeText(data).then(() => {
          WebApp.showAlert('Copied to clipboard successfully!');
        }).catch(err => {
          WebApp.showAlert('Failed to copy: ', err);
        });
      }
    } catch (err) {
      console.error("Cannot set clipboard : error :", err);
    }
  }

  useEffect(() => {
    addEventListener(UnityEventNameSayHi, handleUnityEvent)
    addEventListener(UnityEventShopBuyProduct, handleUnityEventShopBuyProduct)
    addEventListener(UnityEventGameRequestLogin, handleUnityEventGameRequestLogin)
    addEventListener(UnityEventSetClipboard, handleUnityEventSetClipboard)
    addEventListener(UnityEventGameVibrate, handleUnityEventGameVibrate)
    addEventListener(UnityEventGameRequestTonDisconnect, handleUnityEventGameRequestTonDisconnect)
    return () => {
      removeEventListener(UnityEventNameSayHi, handleUnityEvent);
      removeEventListener(UnityEventShopBuyProduct, handleUnityEventShopBuyProduct);
      removeEventListener(UnityEventGameRequestLogin, handleUnityEventGameRequestLogin);
      removeEventListener(UnityEventSetClipboard, handleUnityEventSetClipboard)
      removeEventListener(UnityEventGameVibrate, handleUnityEventGameVibrate)
      removeEventListener(UnityEventGameRequestTonDisconnect, handleUnityEventGameRequestTonDisconnect)
    };
  }, [addEventListener, removeEventListener, handleUnityEvent, handleUnityEventShopBuyProduct, handleUnityEventGameRequestLogin, handleUnityEventSetClipboard, handleUnityEventGameVibrate, handleUnityEventGameRequestTonDisconnect]);
  //#endregion

  //#region Purchase TON
  // Address for user transfer TON.
  const BANK_TON_ADDRESS = config.address_bank;
  const [tonConnectUI, setOptions] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();

  useEffect(()=>{
    console.log("=== userFriendlyAddress changed : " + userFriendlyAddress);
    sendUnityFuncWebSentTonConnected(userFriendlyAddress);
  }, [userFriendlyAddress])

  const handleBuyProductByTon = async (dataJson: any) => {
    let txMsgStr = `${loginUser?.id}:${dataJson?.payload}: Buy at ${getCurrentDateTime()}`;
    console.log("= Start Handle Buy By TON with msg : " + txMsgStr);

    /* Check connect TON wallet or not : If not, show modal connect */
    console.log("= Check Connect Wallet ...")
    try {
      if (!wallet) {
        console.log("=== Not connect, open popup connect now.")
        await tonConnectUI.openModal();
      }
    } catch (e) {
      console.log("=== Connect Wallet error : ", e)
    }


    /* Wallet connected, Now Send transaction */
    console.log("= Wallet connected. Do send transaction..")

    let txMsg = new TonWeb.boc.Cell();
    txMsg.bits.writeUint(0, 32);
    txMsg.bits.writeString(txMsgStr);
    let txPayload = TonWeb.utils.bytesToBase64(await txMsg.toBoc());
    let amount = toNano(dataJson?.priceStar || 0.05).toString();

    const transaction = {
      validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for user to approve
      messages: [
        {
          address: BANK_TON_ADDRESS,
          amount: amount,
          payload: txPayload,
        },
      ],
    }

    try {
      console.log("=== Start send transaction.")
      const result = await tonConnectUI.sendTransaction(transaction);

      // if tx success sent
      console.log('===== Transaction sent successfully:', result);
      sendUnityFuncWebSentTonProcess();

      // you can use signed boc to find the transaction 
      let hashBase64;
      try {
        // Check it deserialized correctly
        const bocCellBytes = await TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(result.boc)).hash();
        hashBase64 = TonWeb.utils.bytesToBase64(bocCellBytes);
        console.log("===== HASH TX : ", hashBase64);

      } catch (error) {
        console.error("=== Decode Boc error : ", error)
      }

      /* Do while check tx really complete success */
      let success = false;
      let hashIdFinally = "";
      const startTime = Date.now();
      while ((Date.now() - startTime < 300000)) {
        try {
          // Fetch the latest transactions for the wallet address
          // "ton_api": "https://testnet.toncenter.com/api/v3/transactions",
          const res = await axios.get(config.ton_api + '?account=' + userFriendlyAddress + '&limit=1&offset=0&sort=desc');
          if (res.data.transactions.length === 0) continue;
          // Check if the transaction with the specific hash is confirmed
          for (const tx of res.data.transactions) {
            if (tx.in_msg.hash === hashBase64 && tx.description.action.success === true) {
              console.log('====== Transaction confirmed:', tx);
              success = tx.description.action.success
              hashIdFinally = tx.hash;
              /* If success break the while */

              break;
            }
          }
          if (success) break;
        } catch (error) {
          console.error('====== Error checking transaction status:', error);
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Wait for the next interval before checking again
      }
      /* Check if success = true -> Call API to BE */
      if (success) {
        console.log("===== Bought via TON done. Call API to BE")
        // TODO CALL API
        /* This tx is really complete success. Now break and call to game > API to confirm BE */

        var rs = {
          state: "success",
          msg: "TON purchased complete",
          data: dataJson,
          hash: hashIdFinally
        }
        sendUnityFuncWebSentTonProcessComplete(rs);
      } else {
        console.log("===== Buy via TON not complete. Send status failed to game")
        var rs = {
          state: "failed",
          msg: "TON purchased not successful",
          data: dataJson,
          hash: hashIdFinally
        }
        sendUnityFuncWebSentTonProcessComplete(rs);
      }

    } catch (e) {
      console.log("= Error Send Tx : ", e)
    }

  }
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

  //#endregion

  //#region Purchase Star Telegram 

  // let invoice: Invoice = initInvoice();

  const handleBuyProductByStar = (dataJson: any) => {

    // invoice
    //   .open(dataJson.telegramLink, 'url')
    //   .then((status) => {
    //     // Output: 'paid'
    //     console.log(status)
    //     var rs = {
    //       state: "failed",
    //       msg: "Not complete purchase",
    //       data: null
    //     }
    //     if (status === 'paid') {
    //       rs = {
    //         state: "success",
    //         msg: status,
    //         data: dataJson
    //       }
    //     } else {
    //       rs = {
    //         state: "failed",
    //         msg: status,
    //         data: null
    //       }
    //     }

    //     sendResultBuyProductToGame(rs);

    //   }).catch((err) => {
    //     console.log("--- purchase failed : error : ", err)

    //   });

  }
  const sendResultBuyProductToGame = (rs: any) => {
    sendMessage(GameObjectWebInteractInGame, UnityFuncResultBuyProduct, JSON.stringify(rs))
  }
  const sendUnityFuncWebPassTelegramPlatform = () => {
    sendMessage(GameObjectWebInteractInGame, UnityFuncWebPassTelegramPlatform, platform?.toString());
  }
  const sendUnityFuncWebSentTonProcess = () => {
    sendMessage(GameObjectWebInteractInGame, UnityFuncWebSentTonProcess, "");
  }
  const sendUnityFuncWebSentTonProcessComplete = (rs: any) => {
    sendMessage(GameObjectWebInteractInGame, UnityFuncWebSentTonProcessComplete, JSON.stringify(rs));
  }
  const sendUnityFuncWebSentTonConnected = (address: string) => {
    sendMessage(GameObjectWebInteractInGame, UnityFuncWebSentTonConnected, address.toString());
  }

  //#endregion

  //#region  Render HTML
  return (
    <div className="box-game" ref={gameRef}>
      <InternetLoading />
      {(!isLoaded || !isShowGame) && (
        <div className="loading-overlay">
          <div>
            <GameLoading loadingProgression={loadingPercentage} />
          </div>
        </div>
      )}


      <div className="box-game__conent-game">
        <div className='hud-button'>
          {/* <button onClick={()=>{sendUnityFuncWebSentTonProcessComplete();}}>CompleteTx</button> */}
          {/* <button onClick={() => {
            tonConnectUI.disconnect();
          }}>Disc</button> */}
          {/* <TonConnectButton /> */}
        </div>
        <Unity
          unityProvider={unityProvider}
          style={{ width: '100%', height: '100%' }}
          id="main-game-play"
        />
      </div>

    </div>
  );

  //#endregion
};

export default PartBoxGame;
