/** @jsxImportSource @emotion/react */

import * as anchor from '@project-serum/anchor';
import TitleBox from 'components/TitleBox';
import Inventory, { ReagentNftData } from 'pages/Mix/Inventory';
import { css, Theme } from '@emotion/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import MixtureMachine from 'components/core/MixtureMachine';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReagentCard from 'pages/Mix/ReagentCard';
import { useWalletNfts } from '@nfteyez/sol-rayz-react';
import { getCandyMachineCreator, getCandyMachineId } from 'components/core/MintMachine/utils/candy-machine';
import { MetaData } from 'components/core/MixtureMachine/types/metaData';
import axios from 'axios';

const Mix = () => {
  const wallet = useWallet();
  const [isMixing, setIsMixing] = useState(false);
  const [leftReagent, setLeftReagent] = useState<ReagentNftData | undefined>(undefined);
  const [rightReagent, setRightReagent] = useState<ReagentNftData | undefined>(undefined);
  const [reagentNftsData, setReagentNftsData] = useState<ReagentNftData[]>([]);
  const { connection } = useConnection();
  const { nfts, isLoading } = useWalletNfts({
    publicAddress: wallet?.publicKey?.toString() ?? '',
    connection,
  });
  const [candyMachineCreator, setCandyMachineCreator] = useState('');

  const isProcessing = useMemo(() => isMixing || isLoading, [isMixing, isLoading]);

  const fetchCandyMachineCreator = async () => {
    const candyMachineCreator = (await getCandyMachineCreator(getCandyMachineId()!))[0].toString();
    setCandyMachineCreator(candyMachineCreator);
  };

  const patchReagentNftsData = useCallback(async () => {
    if (!nfts) return;
    const reagentNftsData = nfts?.filter(
      nft => nft.data.creators[0].address === candyMachineCreator,
    ) as ReagentNftData[];
    try {
      const metaDataList = await Promise.all(
        reagentNftsData.map(reagentNftData => {
          const metadataUrl = reagentNftData.data.uri;
          return getMetaData(metadataUrl);
        }),
      );
      metaDataList.forEach((metaData, idx) => {
        reagentNftsData[idx]['imageUrl'] = metaData.image;
        reagentNftsData[idx]['attributes'] = metaData.attributes;
      });
      console.log(reagentNftsData);
      setReagentNftsData(reagentNftsData);
    } catch (error) {
      console.log(error);
    }
  }, [nfts, candyMachineCreator]);

  const getMetaData = async (metadataUrl: string): Promise<MetaData> => {
    try {
      const response = await axios.get(metadataUrl);
      return response.data;
    } catch (error) {
      throw new Error('getMetaData');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCandyMachineCreator();
      await patchReagentNftsData();
    })();
  }, [nfts]);

  const callbackAfterReagentClick = (mintAccountAddress: string) => {
    const clickedReagentNftsDataIndex = reagentNftsData.findIndex(
      reagentNftData => reagentNftData.mint === mintAccountAddress,
    );
    const clickedReagentNftsData = reagentNftsData[clickedReagentNftsDataIndex];

    let isClickPossible = false;
    if (clickedReagentNftsData.mint === leftReagent?.mint) {
      setLeftReagent(undefined);
      isClickPossible = true;
    }
    if (clickedReagentNftsData.mint === rightReagent?.mint) {
      setRightReagent(undefined);
      isClickPossible = true;
    }

    if (!isClickPossible) {
      if (leftReagent && rightReagent) return;
      if (!leftReagent && !isClickPossible) {
        setLeftReagent(clickedReagentNftsData);
        isClickPossible = true;
      }
      if (!rightReagent && !isClickPossible) {
        setRightReagent(clickedReagentNftsData);
        isClickPossible = true;
      }
    }

    if (isClickPossible) {
      setReagentNftsData(
        reagentNftsData.map(reagentNftData => ({
          ...reagentNftData,
          isClicked:
            reagentNftData.mint === clickedReagentNftsData.mint ? !reagentNftData.isClicked : reagentNftData.isClicked,
        })),
      );
    }
  };

  const childMints = useMemo(() => {
    const leftMint = leftReagent ? [new anchor.web3.PublicKey(leftReagent.mint)] : [];
    const rightMint = rightReagent ? [new anchor.web3.PublicKey(rightReagent.mint)] : [];
    return [...leftMint, ...rightMint];
  }, [leftReagent, rightReagent]);

  const childrenAttributes = useMemo(() => {
    const leftAttributes = leftReagent ? leftReagent.attributes.map(attribute => attribute.value) : [];
    const rightAttributes = rightReagent ? rightReagent.attributes.map(attribute => attribute.value) : [];
    return [...leftAttributes, ...rightAttributes];
  }, [leftReagent, rightReagent]);

  return (
    <div css={mixWrapStyle}>
      <TitleBox title="Mix Reagents" subTitle="You can also mix mixture." />
      {wallet?.publicKey && (
        <>
          <Inventory
            reagentNftsData={reagentNftsData}
            callbackAfterReagentClick={callbackAfterReagentClick}
            isLoading={isLoading}
            disabled={isProcessing}
          />
          <section css={reagentCardsWrapStyle}>
            <ReagentCard data={leftReagent} callbackAfterClick={callbackAfterReagentClick} disabled={isProcessing} />
            <ReagentCard data={rightReagent} callbackAfterClick={callbackAfterReagentClick} disabled={isProcessing} />
          </section>
          <MixtureMachine
            mixBtnCss={mixtureMachineBtnStyle}
            childMints={childMints}
            childrenAttributes={childrenAttributes}
            minChildMintsNumber={2}
            setIsMixing={setIsMixing}
            isMixing={isProcessing}
          />
        </>
      )}
    </div>
  );
};

const mixWrapStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const reagentCardsWrapStyle = css`
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 60px;
`;

const mixtureMachineBtnStyle = (theme: Theme) => css`
  width: 200px;
  height: 40px;
  font-size: 20px;
  color: ${theme.color.dark};
  background-color: ${theme.color.skyblue};
  margin-top: 20px;
  border-radius: 20px;

  &:disabled {
    background-color: ${theme.color.backgroundDark};
  }
`;

export default Mix;
