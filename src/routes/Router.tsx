import { Outlet, useRoutes } from 'react-router-dom';
import Main from '../pages/Main';
import Layout from '../components/Layout';

const Router = () => {
  return useRoutes([
    {
      path: '/',
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [{ path: '', element: <Main /> }],
    },
  ]);
};

export default Router;
