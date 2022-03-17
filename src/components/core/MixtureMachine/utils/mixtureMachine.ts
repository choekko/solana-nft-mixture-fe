import * as anchor from '@project-serum/anchor';
import { MIXTURE_MACHINE_PROGRAM } from 'components/core/MintMachine/const/candy';

export const getMixtureMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    return new anchor.web3.PublicKey('5qboT7jgnuWNQvSShNKegNbKwzAGkJohhYdZcHdbqUxW');
  } catch (e) {
    console.log('Failed to construct MixtureMachine', e);
    return undefined;
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
