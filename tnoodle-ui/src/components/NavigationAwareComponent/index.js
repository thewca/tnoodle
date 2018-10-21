import { Component } from 'react';
import history from '../../history';

export default class NavigationAwareComponent extends Component {
  componentWillMount() {
    this.unblock = history.block(() => this.props.willNavigateAway());
    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  }

  beforeunload(e) {
    let message = this.props.willNavigateAway();
    if (message) {
      e.returnValue = message;
    }
  }

  componentWillUnmount() {
    this.unblock();
    window.removeEventListener('beforeunload', this.beforeunload);
  }

  render() {
    return null;
  }
}
