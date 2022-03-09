/** @jsxImportSource @emotion/react */

import { css, Theme } from '@emotion/react';
import LnbTab from './LnbTab';
import { useLocation } from 'react-router-dom';

const Lnb = () => {
  const location = useLocation();
  const tabs = ['home', 'purchase', 'mix', 'log'] as const;
  const currentFirstPath = location.pathname.split('/')[1];
  const currentTab = currentFirstPath === '' ? 'home' : currentFirstPath;

  return (
    <nav css={lnbCss}>
      <div css={logoCss}>
        <img src="/assets/icon/logo_temporary.png" alt="logo" />
      </div>
      {tabs.map(tab => (
        <LnbTab key={tab} tabName={tab} isClicked={tab === currentTab} />
      ))}
    </nav>
  );
};

const lnbCss = (theme: Theme) => css`
  position: fixed;
  width: 100px;
  height: 100%;
  background-color: ${theme.color.dark};
`;

const logoCss = css`
  width: 100px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 66px;
    height: 66px;
  }
`;

export default Lnb;
