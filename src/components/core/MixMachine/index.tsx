import { mix } from 'components/core/MixMachine/mix';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getCandyMachineId, getMixMachineState } from 'components/core/MintMachine/utils/candy-machine';
import { useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import { awaitTransactionSignatureConfirmation } from 'components/core/MintMachine/utils/connection';

const MixMachine = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

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

  const mixtureMachineId = getCandyMachineId('mixture');
  console.log('mixtureMachineId:: ', mixtureMachineId);

  const handleClick = async () => {
    if (!anchorWallet || !wallet || !wallet.publicKey || !mixtureMachineId) return;
    const mixtureMachineInfo = await getMixMachineState(
      anchorWallet, // useAnchorWallet으로는 호환이 안 된다.
      mixtureMachineId,
      connection,
    );
    const mintTxId = (await mix(mixtureMachineInfo, wallet.publicKey))[0];
    const txTimeoutInMilliseconds = 15000;

    if (mintTxId) {
      await awaitTransactionSignatureConfirmation(mintTxId, txTimeoutInMilliseconds, connection, true);
    }
  };

  return <button onClick={handleClick}>Mix</button>;
};

export default MixMachine;
