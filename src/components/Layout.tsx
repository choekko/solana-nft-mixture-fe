/** @jsxImportSource @emotion/react */

import Lnb from './Lnb';
import { css, Theme } from '@emotion/react';
import React from 'react';
import WalletBtn from './WalletBtn';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Lnb />
      <section css={mainSectionCss}>{children}</section>
      <div css={WalletBtnWrapCss}>
        <WalletBtn />
      </div>
    </div>
  );
};

const mainSectionCss = (theme: Theme) => css`
  margin-left: 100px;
  background-color: ${theme.color.backgroundDeepDark};
  height: 100vh;
`;

const WalletBtnWrapCss = css`
  position: fixed;
  right: 25px;
  top: 25px;
`;

export default Layout;
