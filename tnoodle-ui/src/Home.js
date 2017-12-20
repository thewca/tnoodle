import { Redirect } from 'react-router';
import React, { Component } from 'react';

export default class extends Component {
  render() {
    return <Redirect to="/competitions" />;
  }
}
