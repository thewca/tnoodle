import React from 'react';
import { Link } from 'react-router-dom';

const PreserveSearchLink = ({ to, children, ...rest }) => (
  <Link
    to={{ pathname: to, search: window.location.search }}
    {...rest}
    children={children}
  />
);

export default PreserveSearchLink;
