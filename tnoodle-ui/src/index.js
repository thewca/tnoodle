import React from 'react';
import history from './history';
import { render } from 'react-dom';
import getStore from './redux/store';
import { Provider } from 'react-redux';
import App from '../src/components/App';
import { ConnectedRouter } from 'react-router-redux';

const store = getStore({}, history);

const app = (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>
);

render(app, document.getElementById('root'));
