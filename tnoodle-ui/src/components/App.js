import React from 'react';
import Routes from '../routes';
import Layout from './Layout/Layout';

export const BASE_PATH = process.env.PUBLIC_URL; // TODO move to dotenv

const App = () => (
  <Layout>
    <Routes />
  </Layout>
);

export default App;
