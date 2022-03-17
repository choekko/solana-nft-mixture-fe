import * as anchor from '@project-serum/anchor';
import { getAtaForMint } from 'components/core/MintMachine/utils/solana';
import { SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import {
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { getMetadata } from 'components/core/MintMachine/utils/metaplex';
import { getCandyMachineCreator, getCandyMachineId } from 'components/core/MintMachine/utils/candy-machine';
import { TOKEN_METADATA_PROGRAM_ID } from 'components/core/MintMachine/const/candy';
import { sendTransactions } from 'components/core/MintMachine/utils/connection';

export const mix = async (
  candyMachineInfo: {
    id: anchor.web3.PublicKey;
    program: anchor.Program;
  },
  payer: anchor.web3.PublicKey, // 지갑 주소
): Promise<(string | undefined)[]> => {
  try {
    const mint = anchor.web3.Keypair.generate(); // 아마 랜덤 키쌍을 만드는 거겠지?

    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey, payer))[0];

    const candyMachineAddress = candyMachineInfo.id;
    const signers: anchor.web3.Keypair[] = [mint]; // signers는 아래 instructions와 1:1 매칭이라고 생각하면 좋아.
    const cleanupInstructions: TransactionInstruction[] = []; // 가비지 콜렉팅을 위한 친구인 듯

    const instructions = [
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await candyMachineInfo.program.provider.connection.getMinimumBalanceForRentExemption(MintLayout.span),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, 0, payer, payer, TOKEN_PROGRAM_ID),
      createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, mint.publicKey, TOKEN_PROGRAM_ID),
      createMintToInstruction(mint.publicKey, userTokenAccountAddress, payer, 1, [], TOKEN_PROGRAM_ID),
    ]; // ------- signer : mint

    const transferAuthority1 = anchor.web3.Keypair.generate();

    const childMint1 = new anchor.web3.PublicKey('Hd1TYUnUbT9JwxPjcVv3rDie1EZSXCAdzDBr8ccfLXvv');
    const childMint2 = new anchor.web3.PublicKey('Au6XYF4M3NNkNWLT9RMuKDf2DoRKJBmAGM3CpMaNmsyC');

    const childAta1 = await getAtaForMint(childMint1, payer);
    const childAta2 = await getAtaForMint(childMint2, payer);

    const mixtureMachineId = getCandyMachineId('mixture');
    const vault1 = (await getAtaForMint(childMint1, mixtureMachineId!))[0];
    const vault2 = (await getAtaForMint(childMint2, mixtureMachineId!))[0];

    signers.push(transferAuthority1);

    instructions.push(
      createAssociatedTokenAccountInstruction(payer, vault1, mixtureMachineId!, childMint1, TOKEN_PROGRAM_ID),
    );

    instructions.push(
      createAssociatedTokenAccountInstruction(payer, vault2, mixtureMachineId!, childMint2, TOKEN_PROGRAM_ID),
    );

    instructions.push(
      createApproveInstruction(childAta1[0], transferAuthority1.publicKey, payer, 1, [], TOKEN_PROGRAM_ID),
    );

    instructions.push(
      createApproveInstruction(childAta2[0], transferAuthority1.publicKey, payer, 1, [], TOKEN_PROGRAM_ID),
    );

    const remainingAccount = [
      {
        pubkey: transferAuthority1.publicKey,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: childMint1,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: childAta1[0],
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: vault1,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: transferAuthority1.publicKey,
        isWritable: false,
        isSigner: true,
      },
      {
        pubkey: childMint2,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: childAta2[0],
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: vault2,
        isWritable: true,
        isSigner: false,
      },
    ];

    const metadataAddress = await getMetadata(mint.publicKey);
    const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(candyMachineAddress, 'mixture');

    // instructions.push(
    //   createApproveInstruction(
    //     childAta2[0],
    //     transferAuthority1.publicKey,
    //     payer,
    //     1,
    //     [],
    //     TOKEN_PROGRAM_ID,
    //   )
    // )

    instructions.push(
      await candyMachineInfo.program.instruction.composeNft(creatorBump, {
        accounts: {
          mixtureMachine: candyMachineAddress,
          mixtureMachineCreator: candyMachineCreator,
          payer: payer,
          metadata: metadataAddress,
          mint: mint.publicKey,
          mintAuthority: payer,
          updateAuthority: payer,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
          instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts: remainingAccount,
      }),
    );

    try {
      return (
        await sendTransactions(
          candyMachineInfo.program.provider.connection,
          candyMachineInfo.program.provider.wallet,
          [instructions, cleanupInstructions],
          [signers, []],
        )
      ).txs.map(t => t.txid);
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.error(e);
  }

  return [];
};
