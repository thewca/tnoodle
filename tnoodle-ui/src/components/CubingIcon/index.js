import _ from 'lodash';
import React from 'react';

const CubingIcon = props => {
  const { title, ...rest } = props;
  const className =
    'cubing-icon ' +
    _.map(_.toPairs(rest), ([k, v]) => _.join(`${k}-${v}`, ' '));
  return <span className={className} title={title} />;
};

export default CubingIcon;
