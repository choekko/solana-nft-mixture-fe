import * as anchor from '@project-serum/anchor';
import { MIXTURE_MACHINE_PROGRAM } from 'components/core/MintMachine/const/candy';
import { makeParentMetaData } from 'components/core/MixtureMachine/utils/metaData';
import axios from 'axios';

interface UploaderResponse {
  status: 'success' | 'fail';
  arweaveLink: string;
  mixture: string;
}

export const getMixtureMachineId = async (
  payer: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  childMints: anchor.web3.PublicKey[],
  childrenAttributes: string[],
): Promise<anchor.web3.PublicKey> => {
  try {
    const requestData = makeParentMetaData({
      uniqNumber: 2,
      imageNumber: 2,
      payer,
      parentNftMint: mint,
      childNftMints: childMints,
      childrenAttributes,
    });

    const response: UploaderResponse = await axios.post('localhost:8082/upload', requestData);
    console.log('upload response::', response);
    return new anchor.web3.PublicKey(response.mixture);

    // return new anchor.web3.PublicKey('5qboT7jgnuWNQvSShNKegNbKwzAGkJohhYdZcHdbqUxW');
  } catch (e) {
    throw new Error('Failed to construct MixtureMachine [업로더 실패]');
  }
};

export const getMixtureMachineState = async (
  anchorWallet: anchor.Wallet,
  candyMachineId: anchor.web3.PublicKey,
  connection: anchor.web3.Connection,
) => {
  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: 'confirmed',
  });

  const idl = await anchor.Program.fetchIdl(MIXTURE_MACHINE_PROGRAM, provider);
  const program = new anchor.Program(idl!, MIXTURE_MACHINE_PROGRAM, provider);

  return {
    id: candyMachineId,
    program,
    // state는 안넣음
  };
};

export const getMixtureMachineCreator = async (
  mixtureMachine: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('mixture_machine'), mixtureMachine.toBuffer()],
    MIXTURE_MACHINE_PROGRAM,
  );
};
