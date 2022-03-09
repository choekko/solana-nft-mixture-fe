import { useRoutes } from 'react-router-dom';
import Main from '../pages/Main';

const Router = () => {
  return useRoutes([{ path: '/', element: <Main /> }]);
};

export default Router;
