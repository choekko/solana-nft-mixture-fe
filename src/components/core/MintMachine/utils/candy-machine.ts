import * as anchor from '@project-serum/anchor';
import { CANDY_MACHINE_PROGRAM, TOKEN_METADATA_PROGRAM_ID } from 'components/core/MintMachine/const/candy';
import { sleep } from 'components/core/MintMachine/utils/connection';
import { CandyMachineInfo } from 'components/core/MintMachine/types/candy';

export const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID!);

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

export const getMetadata = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const getCandyMachineCreator = async (
  candyMachine: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('candy_machine'), candyMachine.toBuffer()],
    CANDY_MACHINE_PROGRAM,
  );
};

export const awaitTransactionSignatureConfirmation = async (
  txid: anchor.web3.TransactionSignature,
  timeout: number,
  connection: anchor.web3.Connection,
  queryStatus = false,
): Promise<anchor.web3.SignatureStatus | null | void> => {
  let done = false;
  let status: anchor.web3.SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  status = await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      console.log('Rejecting for timeout...');
      reject({ timeout: true });
    }, timeout);

    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([txid]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              console.log('REST null result for', txid, status);
            } else if (status.err) {
              console.log('REST error for', txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              console.log('REST no confirmations for', txid, status);
            } else {
              console.log('REST confirmation for', txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            console.log('REST connection error: txid', txid, e);
          }
        }
      })();
      sleep(2000);
    }
  });

  //@ts-ignore
  if (connection._signatureSubscriptions[subId]) {
    connection.removeSignatureListener(subId);
  }
  done = true;
  console.log('Returning status', status);
  return status;
};

// 캔디머신을 불러오는 걸까?
export const getCandyMachineState = async (
  anchorWallet: anchor.Wallet, // wallet 정보야
  candyMachineId: anchor.web3.PublicKey, // 캔디머신 프로그램 id야
  connection: anchor.web3.Connection, // 음~ 이거는 useConnection() 으로도 불러올 수 있던데, 시도해봐야 해. 아마 devnet 같은 걸 말하는 걸꺼야
): Promise<CandyMachineInfo> => {
  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  // 프로그램 idl을 가져와야 내부 메서드를 쓸 수 있겠지?
  const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);

  // 프로그램 넌 내꺼야!
  const program = new anchor.Program(idl!, CANDY_MACHINE_PROGRAM, provider);

  // 여기서 candyMachineId는 캔디머신 data account 야~
  const state: any = await program.account.candyMachine.fetch(candyMachineId);
  const itemsAvailable = state.data.itemsAvailable.toNumber(); // 가능 개수
  const itemsRedeemed = state.itemsRedeemed.toNumber(); // 팔린 개수
  const itemsRemaining = itemsAvailable - itemsRedeemed; // 남은 개수

  return {
    id: candyMachineId, // 캔디머신 프로그램 Id
    program, // 캔디머신 프로그램
    // config 참고 https://docs.metaplex.com/candy-machine-v2/configuration
    state: {
      itemsAvailable,
      itemsRedeemed,
      itemsRemaining,
      isSoldOut: itemsRemaining === 0, // 다 팔렸니
      isActive: false,
      isPresale: false, // 선판매
      isWhitelistOnly: false, // 화이트리스트만 가능해
      goLiveDate: state.data.goLiveDate, // 판매시각
      treasury: state.wallet, // 지갑 주소
      tokenMint: state.tokenMint, //  Mint account 얘기하는 거 같아
      gatekeeper: state.data.gatekeeper,
      endSettings: state.data.endSettings, // 종료 기준 설정
      whitelistMintSettings: state.data.whitelistMintSettings,
      hiddenSettings: state.data.hiddenSettings,
      price: state.data.price, // 가격 (근데 spl token 개수도 넣을 수 있다는 데?)
    },
  };
};
