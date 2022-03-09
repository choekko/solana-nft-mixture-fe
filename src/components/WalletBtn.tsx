/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';

const WalletBtn = () => {
  return (
    <button css={WalletBtnCss}>
      <img src="/assets/icon/wallet_dark.png" css={{ width: '30px' }} />
      <span> Wallet </span>
    </button>
  );
};

const WalletBtnCss = (theme: Theme) => css`
  border-radius: 20px;
  width: 200px;
  height: 50px;
  font-size: 22px;
  font-weight: bold;
  background-color: ${theme.color.skyblue};
  color: ${theme.color.dark};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding-right: 15px;

  &:hover {
    background-color: white;
  }
`;

export default WalletBtn;
