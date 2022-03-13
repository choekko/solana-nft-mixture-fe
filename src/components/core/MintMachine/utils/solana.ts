import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from 'components/core/example/CandyMachine/example/utils';

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey, // 민트 어카운트
  buyer: anchor.web3.PublicKey, // 구매자 어카운트
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  ); // 반환값은 2개의 요소값을 같은 리스트인데, 0 인덱스 값이 ATA 주소 (seeds값이 동일하면 동일한 ATA가 나올거야)
};
