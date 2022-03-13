// import * as anchor from '@project-serum/anchor';
//
// import {
//   createInitializeMintInstruction,
//   createMintToInstruction,
//   MintLayout,
//   TOKEN_PROGRAM_ID,
// } from '@solana/spl-token';
// import { SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY } from '@solana/web3.js';
// import { sendTransactions } from 'components/core/example/CandyMachine/example/connection';
//
// import {
//   CIVIC,
//   getAtaForMint,
//   getNetworkExpire,
//   getNetworkToken,
//   SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
// } from 'components/core/example/CandyMachine/example/utils';
// import { useAnchorWallet } from '@solana/wallet-adapter-react';
//
// export const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
//   'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
// ); // 메타플렉스 캔디머신 프로그램 주소같다
//
// const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
//   'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
// );
//
// interface CandyMachineState {
//   itemsAvailable: number;
//   itemsRedeemed: number;
//   itemsRemaining: number;
//   treasury: anchor.web3.PublicKey;
//   tokenMint: anchor.web3.PublicKey;
//   isSoldOut: boolean;
//   isActive: boolean;
//   isPresale: boolean;
//   isWhitelistOnly: boolean;
//   goLiveDate: anchor.BN;
//   price: anchor.BN;
//   gatekeeper: null | {
//     expireOnUse: boolean;
//     gatekeeperNetwork: anchor.web3.PublicKey;
//   };
//   endSettings: null | {
//     number: anchor.BN;
//     endSettingType: any;
//   };
//   whitelistMintSettings: null | {
//     mode: any;
//     mint: anchor.web3.PublicKey;
//     presale: boolean;
//     discountPrice: null | anchor.BN;
//   };
//   hiddenSettings: null | {
//     name: string;
//     uri: string;
//     hash: Uint8Array;
//   };
// }
//
// export interface CandyMachineAccount {
//   id: anchor.web3.PublicKey;
//   program: anchor.Program;
//   state: CandyMachineState;
// }
//
// export const awaitTransactionSignatureConfirmation = async (
//   txid: anchor.web3.TransactionSignature,
//   timeout: number,
//   connection: anchor.web3.Connection,
//   queryStatus = false,
// ): Promise<anchor.web3.SignatureStatus | null | void> => {
//   let done = false;
//   let status: anchor.web3.SignatureStatus | null | void = {
//     slot: 0,
//     confirmations: 0,
//     err: null,
//   };
//   let subId = 0;
//   status = await new Promise(async (resolve, reject) => {
//     setTimeout(() => {
//       if (done) {
//         return;
//       }
//       done = true;
//       console.log('Rejecting for timeout...');
//       reject({ timeout: true });
//     }, timeout);
//
//     while (!done && queryStatus) {
//       // eslint-disable-next-line no-loop-func
//       (async () => {
//         try {
//           const signatureStatuses = await connection.getSignatureStatuses([
//             txid,
//           ]);
//           status = signatureStatuses && signatureStatuses.value[0];
//           if (!done) {
//             if (!status) {
//               console.log('REST null result for', txid, status);
//             } else if (status.err) {
//               console.log('REST error for', txid, status);
//               done = true;
//               reject(status.err);
//             } else if (!status.confirmations) {
//               console.log('REST no confirmations for', txid, status);
//             } else {
//               console.log('REST confirmation for', txid, status);
//               done = true;
//               resolve(status);
//             }
//           }
//         } catch (e) {
//           if (!done) {
//             console.log('REST connection error: txid', txid, e);
//           }
//         }
//       })();
//       await sleep(2000);
//     }
//   });
//
//   //@ts-ignore
//   if (connection._signatureSubscriptions[subId]) {
//     connection.removeSignatureListener(subId);
//   }
//   done = true;
//   console.log('Returning status', status);
//   return status;
// };
//
// const createAssociatedTokenAccountInstruction = (
//   associatedTokenAddress: anchor.web3.PublicKey,
//   payer: anchor.web3.PublicKey,
//   walletAddress: anchor.web3.PublicKey,
//   splTokenMintAddress: anchor.web3.PublicKey,
// ) => {
//   const keys = [
//     { pubkey: payer, isSigner: true, isWritable: true },
//     { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
//     { pubkey: walletAddress, isSigner: false, isWritable: false },
//     { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SystemProgram.programId,
//       isSigner: false,
//       isWritable: false,
//     },
//     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//     {
//       pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
//       isSigner: false,
//       isWritable: false,
//     },
//   ];
//   return new anchor.web3.TransactionInstruction({
//     keys,
//     programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
//     data: Buffer.from([]),
//   });
// };
//
//
// // 캔디머신을 불러오는 걸까?
// export const getCandyMachineState = async (
//   anchorWallet: anchor.Wallet,  // wallet 정보야
//   candyMachineId: anchor.web3.PublicKey, // 캔디머신 프로그램 id야
//   connection: anchor.web3.Connection, // 음~ 이거는 useConnection() 으로도 불러올 수 있던데, 시도해봐야 해. 아마 devnet 같은 걸 말하는 걸꺼야
// ): Promise<CandyMachineAccount> => {
//   const provider = new anchor.Provider(connection, anchorWallet, {
//     preflightCommitment: 'processed',
//   });
//
//   // 프로그램 idl을 가져와야 내부 메서드를 쓸 수 있겠지?
//   const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);
//
//   // 프로그램 넌 내꺼야!
//   const program = new anchor.Program(idl!, CANDY_MACHINE_PROGRAM, provider);
//
//   // 여기서 candyMachineId는 캔디머신 data account 야~
//   const state: any = await program.account.candyMachine.fetch(candyMachineId);
//   const itemsAvailable = state.data.itemsAvailable.toNumber(); // 가능 개수
//   const itemsRedeemed = state.itemsRedeemed.toNumber(); // 팔린 개수
//   const itemsRemaining = itemsAvailable - itemsRedeemed; // 남은 개수
//
//   return {
//     id: candyMachineId, // 캔디머신 data account
//     program, // 캔디머신 프로그램
//     // config 참고 https://docs.metaplex.com/candy-machine-v2/configuration
//     state: {
//       itemsAvailable,
//       itemsRedeemed,
//       itemsRemaining,
//       isSoldOut: itemsRemaining === 0, // 다 팔렸니
//       isActive: false,
//       isPresale: false, // 선판매
//       isWhitelistOnly: false, // 화이트리스트만 가능해
//       goLiveDate: state.data.goLiveDate, // 판매시각
//       treasury: state.wallet, // 지갑 주소
//       tokenMint: state.tokenMint, //  Mint account 얘기하는 거 같아
//       gatekeeper: state.data.gatekeeper,
//       endSettings: state.data.endSettings, // 종료 기준 설정
//       whitelistMintSettings: state.data.whitelistMintSettings,
//       hiddenSettings: state.data.hiddenSettings,
//       price: state.data.price, // 가격 (근데 spl token 개수도 넣을 수 있다는 데?)
//     },
//   };
// };
//
// const getMasterEdition = async (
//   mint: anchor.web3.PublicKey,
// ): Promise<anchor.web3.PublicKey> => {
//   return (
//     await anchor.web3.PublicKey.findProgramAddress(
//       [
//         Buffer.from('metadata'),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         mint.toBuffer(),
//         Buffer.from('edition'),
//       ],
//       TOKEN_METADATA_PROGRAM_ID,
//     )
//   )[0];
// };
//
// const getMetadata = async (
//   mint: anchor.web3.PublicKey,
// ): Promise<anchor.web3.PublicKey> => {
//   return (
//     await anchor.web3.PublicKey.findProgramAddress(
//       [
//         Buffer.from('metadata'),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         mint.toBuffer(),
//       ],
//       TOKEN_METADATA_PROGRAM_ID,
//     )
//   )[0];
// };
//
// export const getCandyMachineCreator = async (
//   candyMachine: anchor.web3.PublicKey,
// ): Promise<[anchor.web3.PublicKey, number]> => {
//   return await anchor.web3.PublicKey.findProgramAddress(
//     [Buffer.from('candy_machine'), candyMachine.toBuffer()],
//     CANDY_MACHINE_PROGRAM,
//   );
// };
//
// export const getCollectionPDA = async (
//   candyMachineAddress: anchor.web3.PublicKey,
// ): Promise<[anchor.web3.PublicKey, number]> => {
//   return await anchor.web3.PublicKey.findProgramAddress(
//     [Buffer.from('collection'), candyMachineAddress.toBuffer()],
//     CANDY_MACHINE_PROGRAM,
//   );
// };
//
// export interface CollectionData {
//   mint: anchor.web3.PublicKey;
//   candyMachine: anchor.web3.PublicKey;
// }
//
// export const getCollectionAuthorityRecordPDA = async (
//   mint: anchor.web3.PublicKey,
//   newAuthority: anchor.web3.PublicKey,
// ): Promise<anchor.web3.PublicKey> => {
//   return (
//     await anchor.web3.PublicKey.findProgramAddress(
//       [
//         Buffer.from('metadata'),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         mint.toBuffer(),
//         Buffer.from('collection_authority'),
//         newAuthority.toBuffer(),
//       ],
//       TOKEN_METADATA_PROGRAM_ID,
//     )
//   )[0];
// };
//
// // 민트를 시작해보자
// export const mintOneToken = async (
//   candyMachine: CandyMachineAccount, // PDA 를 넣어야해
//   payer: anchor.web3.PublicKey, // 지갑 주소
// ): Promise<(string | undefined)[]> => {
//   const mint = anchor.web3.Keypair.generate(); // 아마 랜덤 키쌍을 만드는 거겠지?
//
//   const userTokenAccountAddress = (
//     await getAtaForMint(mint.publicKey, payer)
//   )[0];
//
//   // 거래 대상 주소일까??
//   const userPayingAccountAddress = candyMachine.state.tokenMint
//     ? (await getAtaForMint(candyMachine.state.tokenMint, payer))[0] // tokenMint에 대한 ATA
//     : payer;
//
//   const candyMachineAddress = candyMachine.id;
//   const remainingAccounts = [];
//   const signers: anchor.web3.Keypair[] = [mint]; // signers는 아래 instructions와 1:1 매칭이라고 생각하면 좋아.
//   const cleanupInstructions = [];
//   const instructions = [
//     anchor.web3.SystemProgram.createAccount({
//       fromPubkey: payer,
//       newAccountPubkey: mint.publicKey,
//       space: MintLayout.span,
//       lamports:
//         await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(
//           MintLayout.span,
//         ),
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     createInitializeMintInstruction(
//       mint.publicKey,
//       0,
//       payer,
//       payer,
//       TOKEN_PROGRAM_ID,
//     ),
//     createAssociatedTokenAccountInstruction(
//       userTokenAccountAddress,
//       payer,
//       payer,
//       mint.publicKey,
//     ),
//     createMintToInstruction(
//       TOKEN_PROGRAM_ID,
//       mint.publicKey,
//       userTokenAccountAddress,
//       payer,
//       [],
//       1,
//     ),
//   ]; // ------- signer : mint
//
//   if (candyMachine.state.gatekeeper) {
//     remainingAccounts.push({
//       pubkey: (
//         await getNetworkToken(
//           payer,
//           candyMachine.state.gatekeeper.gatekeeperNetwork,
//         )
//       )[0],
//       isWritable: true,
//       isSigner: false,
//     });
//     if (candyMachine.state.gatekeeper.expireOnUse) {
//       remainingAccounts.push({
//         pubkey: CIVIC,
//         isWritable: false,
//         isSigner: false,
//       });
//       remainingAccounts.push({
//         pubkey: (
//           await getNetworkExpire(
//             candyMachine.state.gatekeeper.gatekeeperNetwork,
//           )
//         )[0],
//         isWritable: false,
//         isSigner: false,
//       });
//     }
//   }
//   if (candyMachine.state.whitelistMintSettings) {
//     const mint = new anchor.web3.PublicKey(
//       candyMachine.state.whitelistMintSettings.mint,
//     );
//
//     const whitelistToken = (await getAtaForMint(mint, payer))[0];
//     remainingAccounts.push({
//       pubkey: whitelistToken,
//       isWritable: true,
//       isSigner: false,
//     });
//
//     if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
//       const whitelistBurnAuthority = anchor.web3.Keypair.generate();
//
//       remainingAccounts.push({
//         pubkey: mint,
//         isWritable: true,
//         isSigner: false,
//       });
//       remainingAccounts.push({
//         pubkey: whitelistBurnAuthority.publicKey,
//         isWritable: false,
//         isSigner: true,
//       });
//       signers.push(whitelistBurnAuthority); // singer 추가. 그렇다는건 그에 맞는 instruction을 추가할거라는 것
//       const exists =
//         await candyMachine.program.provider.connection.getAccountInfo(
//           whitelistToken,
//         );
//       if (exists) {
//         instructions.push(
//           Token.createApproveInstruction(
//             TOKEN_PROGRAM_ID,
//             whitelistToken,
//             whitelistBurnAuthority.publicKey,
//             payer,
//             [],
//             1,
//           ),
//         );
//         cleanupInstructions.push(
//           Token.createRevokeInstruction(
//             TOKEN_PROGRAM_ID,
//             whitelistToken,
//             payer,
//             [],
//           ),
//         );
//       }
//     }
//   }
//
//   if (candyMachine.state.tokenMint) {
//     const transferAuthority = anchor.web3.Keypair.generate();
//
//     signers.push(transferAuthority);
//     remainingAccounts.push({
//       pubkey: userPayingAccountAddress,
//       isWritable: true,
//       isSigner: false,
//     });
//     remainingAccounts.push({
//       pubkey: transferAuthority.publicKey,
//       isWritable: false,
//       isSigner: true,
//     });
//
//     instructions.push(
//       Token.createApproveInstruction(
//         TOKEN_PROGRAM_ID,
//         userPayingAccountAddress,
//         transferAuthority.publicKey,
//         payer,
//         [],
//         candyMachine.state.price.toNumber(),
//       ),
//     );
//     cleanupInstructions.push(
//       Token.createRevokeInstruction(
//         TOKEN_PROGRAM_ID,
//         userPayingAccountAddress,
//         payer,
//         [],
//       ),
//     );
//   }
//   const metadataAddress = await getMetadata(mint.publicKey);
//   const masterEdition = await getMasterEdition(mint.publicKey);
//
//   const [collectionPDA] = await getCollectionPDA(candyMachineAddress);
//   const collectionPDAAccount =
//     await candyMachine.program.provider.connection.getAccountInfo(
//       collectionPDA,
//     );
//   if (collectionPDAAccount) {
//     try {
//       const collectionData =
//         (await candyMachine.program.account.collectionPda.fetch(
//           collectionPDA,
//         )) as CollectionData;
//       console.log(collectionData);
//       const collectionMint = collectionData.mint;
//       const collectionAuthorityRecord = await getCollectionAuthorityRecordPDA(
//         collectionMint,
//         collectionPDA,
//       );
//       console.log(collectionMint);
//       if (collectionMint) {
//         const collectionMetadata = await getMetadata(collectionMint);
//         const collectionMasterEdition = await getMasterEdition(collectionMint);
//         remainingAccounts.push(
//           ...[
//             {
//               pubkey: collectionPDA,
//               isWritable: true,
//               isSigner: false,
//             },
//             {
//               pubkey: collectionMint,
//               isWritable: false,
//               isSigner: false,
//             },
//             {
//               pubkey: collectionMetadata,
//               isWritable: true,
//               isSigner: false,
//             },
//             {
//               pubkey: collectionMasterEdition,
//               isWritable: false,
//               isSigner: false,
//             },
//             {
//               pubkey: collectionAuthorityRecord,
//               isWritable: false,
//               isSigner: false,
//             },
//           ],
//         );
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }
//
//   const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
//     candyMachineAddress,
//   );
//
//   instructions.push(
//     await candyMachine.program.instruction.mintNft(creatorBump, {
//       accounts: {
//         candyMachine: candyMachineAddress,
//         candyMachineCreator,
//         payer: payer,
//         wallet: candyMachine.state.treasury,
//         mint: mint.publicKey,
//         metadata: metadataAddress,
//         masterEdition,
//         mintAuthority: payer,
//         updateAuthority: payer,
//         tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: SystemProgram.programId,
//         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
//         recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
//         instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
//       },
//       remainingAccounts:
//         remainingAccounts.length > 0 ? remainingAccounts : undefined,
//     }),
//   );
//
//   try {
//     return (
//       await sendTransactions(
//         candyMachine.program.provider.connection,
//         candyMachine.program.provider.wallet,
//         [instructions, cleanupInstructions],
//         [signers, []],
//       )
//     ).txs.map(t => t.txid);
//   } catch (e) {
//     console.log(e);
//   }
//
//   return [];
// };
//
// export const shortenAddress = (address: string, chars = 4): string => {
//   return `${address.slice(0, chars)}...${address.slice(-chars)}`;
// };
//
// const sleep = (ms: number): Promise<void> => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// };
