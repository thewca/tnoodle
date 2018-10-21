import React from 'react';
import DocumentTitle from 'react-document-title';
import PreserveSearchRedirect from '../PreserveSearchRedirect';

const Home = () => (
  <DocumentTitle title="TNoodle">
    <PreserveSearchRedirect to="/competitions" />
  </DocumentTitle>
);

export default Home;
