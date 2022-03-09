/** @jsxImportSource @emotion/react */

import Lnb from './Lnb';
import { css, Theme } from '@emotion/react';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Lnb />
      <section css={mainSectionStyle}>{children}</section>
    </div>
  );
};

const mainSectionStyle = (theme: Theme) => css`
  margin-left: 100px;
  background-color: ${theme.color.backgroundDeepDark};
  height: 100vh;
`;

export default Layout;
