import React from 'react';
import { Link } from 'react-router-dom';

export default function({ to, children, ...rest }) {
  return <Link to={{ pathname: to, search: window.location.search }} {...rest}>{children}</Link>;
}
