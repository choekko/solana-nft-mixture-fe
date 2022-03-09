/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';

interface LnbTabProps {
  tabName: 'home' | 'purchase' | 'log' | 'mix' | 'compare';
  isClicked: boolean;
}

const LnbTab = ({ tabName, isClicked }: LnbTabProps) => {
  const iconColorType = isClicked ? 'skyblue' : 'dark';

  return (
    <>
      <div css={theme => LabTabStyle(theme, isClicked)}>
        <img src={`/assets/icon/${tabName}_${iconColorType}.png`} alt={tabName} />
        <span>{tabName}</span>
      </div>
    </>
  );
};

const LabTabStyle = (theme: Theme, isClicked: boolean) => css`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 100px;
  background-color: ${isClicked ? 'white' : theme.color.skyblue};

  img {
    width: 50px;
    height: 50px;
  }

  span {
    color: ${isClicked ? theme.color.skyblue : theme.color.dark};
    font-weight: bold;
  }
`;

export default LnbTab;
