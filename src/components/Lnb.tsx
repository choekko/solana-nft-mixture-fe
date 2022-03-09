/** @jsxImportSource @emotion/react */

import { css, Theme } from '@emotion/react';
import LnbTab from './LnbTab';
import { useLocation } from 'react-router-dom';

const Lnb = () => {
  const location = useLocation();
  const tabs = ['home', 'purchase', 'mix', 'log', 'compare'] as const;
  const currentFirstPath = location.pathname.split('/')[1];
  const currentTab = currentFirstPath === '' ? 'home' : currentFirstPath;

  return (
    <nav css={lnbCss}>
      <div css={{ flex: 'none' }}>
        <div css={logoCss}>
          <img src="/assets/icon/logo_temporary.png" alt="logo" />
        </div>
        {tabs.map(tab => tab !== 'compare' && <LnbTab key={tab} tabName={tab} isCurrentTab={tab === currentTab} />)}
      </div>
      <div css={{ marginBottom: '20px' }}>
        <LnbTab tabName="compare" isCurrentTab={currentTab === 'compare'} />
      </div>
    </nav>
  );
};

const lnbCss = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
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
