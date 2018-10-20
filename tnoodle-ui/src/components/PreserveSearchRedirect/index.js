import React from 'react';
import { Redirect } from 'react-router';

const PreserveSearchRedirect = ({ to, ...rest }) => (
  <Redirect to={{ pathname: to, search: window.location.search }} {...rest} />
);

export default PreserveSearchRedirect;
