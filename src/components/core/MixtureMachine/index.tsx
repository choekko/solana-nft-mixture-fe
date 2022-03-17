/** @jsxImportSource @emotion/react */

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { awaitTransactionSignatureConfirmation } from 'components/core/MintMachine/utils/connection';
import { getMixtureMachineId, getMixtureMachineState } from 'components/core/MixtureMachine/utils/mixtureMachine';
import { mix } from 'components/core/MixtureMachine/utils/mix';
import { SerializedStyles, Theme } from '@emotion/react';

interface MixtureMachineProps {
  childMints: anchor.web3.PublicKey[];
  childrenAttributes: string[];
  minChildMintsNumber: number;
  setIsMixing?: Dispatch<SetStateAction<boolean>>;
  isMixing?: boolean;
  callbackAfterMix?: () => void;
  mixBtnCss?: ((theme: Theme) => SerializedStyles) | SerializedStyles;
}

const MixtureMachine = ({
  childMints,
  childrenAttributes,
  minChildMintsNumber,
  mixBtnCss,
  setIsMixing,
  isMixing,
  callbackAfterMix,
}: MixtureMachineProps) => {
  const [isMixPossible, setIsMixPossible] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (childMints.length === minChildMintsNumber) {
      setIsMixPossible(true);
    }
  });

  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  console.log(childrenAttributes);

  const handleClick = async () => {
    if (!anchorWallet || !wallet || !wallet.publicKey) return;

    setIsMixing?.(true);

    try {
      const mintKeyPair = anchor.web3.Keypair.generate();
      const mixtureMachineId = await getMixtureMachineId(
        wallet.publicKey,
        mintKeyPair.publicKey,
        childMints,
        childrenAttributes,
      );
      const mixtureMachineInfo = await getMixtureMachineState(anchorWallet, mixtureMachineId, connection);
      const mintTxId = (await mix(mintKeyPair, mixtureMachineInfo, wallet.publicKey, childMints))[0];
      const txTimeoutInMilliseconds = 15000;

      if (mintTxId) {
        await awaitTransactionSignatureConfirmation(mintTxId, txTimeoutInMilliseconds, connection, true);
        callbackAfterMix?.();
      }
    } catch (error) {
      setIsMixing?.(false);
    }

    setIsMixing?.(false);
  };

  return (
    <button css={mixBtnCss} onClick={handleClick} disabled={!isMixPossible || isMixing}>
      Mix
    </button>
  );
};

export default MixtureMachine;
