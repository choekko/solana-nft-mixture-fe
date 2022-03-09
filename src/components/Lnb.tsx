/** @jsxImportSource @emotion/react */

import { css, Theme } from '@emotion/react';

const Lnb = () => {
  return <nav css={lnbCss} />;
};

const lnbCss = (theme: Theme) => css`
  position: fixed;
  width: 100px;
  height: 100%;
  background-color: ${theme.color.dark};
`;

export default Lnb;
