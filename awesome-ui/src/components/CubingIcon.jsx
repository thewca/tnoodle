import _ from "lodash";
import React from "react";
import "./CubingIcon.scss";

export default function(props) {
  let { title, ...rest } = props;
  let className =
    "cubing-icon " +
    _.toPairs(rest)
      .map(([k, v]) => `${k}-${v}`)
      .join(" ");
  return <span className={className} title={title} />;
}
