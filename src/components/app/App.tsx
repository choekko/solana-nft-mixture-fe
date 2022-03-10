import React from 'react';
import './App.css';
import 'styles/walletStyle.css';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import Router from '../../routes/Router';

function App() {
  const wallets = [new PhantomWalletAdapter()];

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <main className="App">
          <Router />
        </main>
      </WalletModalProvider>
    </WalletProvider>
  );
}

export default App;
