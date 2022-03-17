import * as anchor from '@project-serum/anchor';

interface MakeParentMetaDataJsonParam {
  uniqNumber: number;
  imageNumber: number;
  payer: anchor.web3.PublicKey;
  parentNftMint: anchor.web3.PublicKey;
  childNftMints: anchor.web3.PublicKey[];
  childrenAttributes: string[];
  network?: string;
}

export const makeParentMetaData = ({
  uniqNumber,
  imageNumber,
  payer,
  parentNftMint,
  childNftMints,
  childrenAttributes,
  network = 'devnet',
}: MakeParentMetaDataJsonParam) => {
  const parentMetaData = {
    metadata: {
      name: `Mixture #${uniqNumber}`,
      symbol: 'Mixture',
      image: `${imageNumber}.png`,
      attributes: childrenAttributes,
      properties: {
        files: [
          {
            uri: `${imageNumber}.png`,
            type: 'image/png',
          },
        ],
        creators: [
          {
            address: payer.toString(),
            share: 100,
          },
        ],
        children: [
          {
            is_children: true,
            pubkeys: childNftMints.map(childNftMint => childNftMint.toString()),
          },
        ],
      },
    },
    network: network,
    composableNFTIndex: uniqNumber,
    parentNFT: parentNftMint,
  };

  return parentMetaData;
};
