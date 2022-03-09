/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { useState } from 'react';

interface LnbTabProps {
  tabName: 'home' | 'purchase' | 'log' | 'mix' | 'compare';
  isCurrentTab: boolean;
}

const LnbTab = ({ tabName, isCurrentTab }: LnbTabProps) => {
  const [isActive, setIsActive] = useState(isCurrentTab);
  const iconColorType = isActive ? 'skyblue' : 'dark';

  const handleMouseEnter = () => {
    setIsActive(true);
  };

  const handleMouseLeave = () => {
    if (!isCurrentTab) {
      setIsActive(false);
    }
  };

  return (
    <>
      <button
        css={theme => LabTabStyle(theme, isActive)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={`/assets/icon/${tabName}_${iconColorType}.png`} alt={tabName} />
        <span>{tabName}</span>
      </button>
    </>
  );
};

const LabTabStyle = (theme: Theme, isActive: boolean) => css`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 100px;
  background-color: ${isActive ? 'white' : theme.color.skyblue};
  border: 0.5px solid ${theme.color.dark};

  img {
    width: 50px;
    height: 50px;
  }

  span {
    color: ${isActive ? theme.color.skyblue : theme.color.dark};
    font-weight: bold;
  }
`;

export default LnbTab;
