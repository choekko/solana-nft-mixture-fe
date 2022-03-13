/** @jsxImportSource @emotion/react */
import * as anchor from '@project-serum/anchor';
import { css, Theme } from '@emotion/react';
import {
  awaitTransactionSignatureConfirmation,
  getCandyMachineId,
  getCandyMachineState,
} from 'components/core/MintMachine/utils/candy-machine';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CandyMachineInfo } from 'components/core/MintMachine/types/candy';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { mintOneToken } from 'components/core/MintMachine/utils/mint';
import { AlertState } from 'components/core/example/CandyMachine/example/utils';

const MintMachine = () => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachineInfo, setCandyMachineInfo] = useState<CandyMachineInfo>();
  const [isActive, setIsActive] = useState(false);
  const [itemsRemaining, setItemsRemaining] = useState<number>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const candyMachineId = useMemo(() => getCandyMachineId(), []);
  const { connection } = useConnection();
  const txTimeoutInMilliseconds = 30000;

  const wallet = useWallet();

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

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet || !candyMachineId) {
      return;
    }

    let active = true;

    try {
      const candyMachineInfo = await getCandyMachineState(
        anchorWallet, // useAnchorWallet으로는 호환이 안 된다.
        candyMachineId,
        connection,
      );

      console.log(candyMachineInfo.state);
      setItemsRemaining(candyMachineInfo.state.itemsAvailable);

      // TODO: 민트 머신은 무한히 뽑을 수 있어야하는데 흠..
      if (candyMachineInfo.state.endSettings?.endSettingType.amount) {
        const limit = Math.min(
          candyMachineInfo.state.endSettings.number.toNumber(),
          candyMachineInfo.state.itemsAvailable,
        );
        if (candyMachineInfo.state.itemsRedeemed < limit) {
          setItemsRemaining(limit - candyMachineInfo.state.itemsRedeemed);
        } else {
          setItemsRemaining(0);
          candyMachineInfo.state.isSoldOut = true;
        }
      }
      if (candyMachineInfo.state.isSoldOut) {
        active = false;
      }

      setIsActive((candyMachineInfo.state.isActive = active));
      setCandyMachineInfo(candyMachineInfo);
    } catch (error) {
      console.error(error);
      throw new Error('캔디머신 상태 동기화 실패');
    }
  }, [wallet, candyMachineId, connection]);

  const handleMintBtnClick = async () => {
    try {
      setIsUserMinting(true);

      if (wallet.connected && candyMachineInfo?.program && wallet.publicKey) {
        const mintTxId = (await mintOneToken(candyMachineInfo, wallet.publicKey))[0];

        console.log('heeerree');

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(mintTxId, txTimeoutInMilliseconds, connection, true);
        }

        console.log('heeerree2');
        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachineInfo.state.isActive = remaining > 0));
          candyMachineInfo.state.isSoldOut = remaining === 0;
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }
      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
      refreshCandyMachineState();
    }
    setIsUserMinting(false);
  };

  useEffect(() => {
    refreshCandyMachineState();
    console.log(wallet, 'Effect');
  }, [anchorWallet, connection, candyMachineId, refreshCandyMachineState]);

  return (
    <>
      <button css={theme => MintMachineCss(theme)} disabled={!isActive || isUserMinting} onClick={handleMintBtnClick}>
        민트 머신 테스트 : {itemsRemaining}
      </button>
      <span style={{ color: 'white' }}>
        active: {isActive ? 'yes' : 'no'} , isUserMinting: {isUserMinting ? 'yes' : 'no'}
      </span>
      <div> {alertState.message} </div>
    </>
  );
};

const MintMachineCss = (theme: Theme) => css`
  width: 100px;
  height: 50px;
  border-radius: 20px;
  background-color: ${theme.color.skyblue};
`;

export default MintMachine;
