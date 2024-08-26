import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom';
import createRoutes from '../src/routes';
import './styles/global.scss';
import './App.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import config from './config';

function App() {
  // const [count, setCount] = useState(0)
  const manifestUrl = config.ton_manifestUrl;
  return (
    <>
      <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/TeleMiniAppBrianBot/coinmaster'
      }}
    >

      <BrowserRouter>
        {createRoutes()}
      </BrowserRouter>
    </TonConnectUIProvider>
    </>
  )
}

export default App
