import React from 'react';
import { Redirect } from 'react-router';

export default function({ to, ...rest }) {
  return <Redirect to={{ pathname: to, search: window.location.search }} {...rest} />;
}
