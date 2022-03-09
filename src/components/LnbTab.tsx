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
        css={theme => LabTabStyle(theme, tabName, isActive)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img src={`/assets/icon/${tabName}_${iconColorType}.png`} alt={tabName} />
        {tabName !== 'compare' && <span>{tabName}</span>}
      </button>
    </>
  );
};

const LabTabStyle = (theme: Theme, tabName: string, isActive: boolean) => css`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: ${tabName === 'compare' ? '70px' : '100px'};
  height: ${tabName === 'compare' ? '70px' : '100px'};
  background-color: ${isActive ? 'white' : theme.color.skyblue};
  border: 0.5px solid ${theme.color.dark};

  ${tabName === 'compare' &&
  css`
    border-radius: 20px;
  `}

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
