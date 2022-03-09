/** @jsxImportSource @emotion/react */

import Lnb from './Lnb';
import { css } from '@emotion/react';
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

const mainSectionStyle = css`
  margin-left: 100px;
`;

export default Layout;
