import { Outlet, useRoutes } from 'react-router-dom';
import Main from '../pages/Main';
import Layout from '../components/Layout';
import Purchase from '../pages/Purchase';
import Mix from '../pages/Mix';
import Log from '../pages/Log';
import Compare from '../pages/Compare';

const Router = () => {
  return useRoutes([
    {
      path: '/',
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        { path: '', element: <Main /> },
        { path: 'purchase', element: <Purchase /> },
        { path: 'mix', element: <Mix /> },
        { path: 'log', element: <Log /> },
        { path: 'compare', element: <Compare /> },
      ],
    },
  ]);
};

export default Router;
