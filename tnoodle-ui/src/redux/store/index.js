import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';

import * as reducers from '../reducers/reducers';

const rootReducer = combineReducers({
  ...reducers,
  router: routerReducer
});

const getStore = (initialState = {}, history) => {
  const middlewares = [routerMiddleware(history), thunk];
  const enhancers = [composeWithDevTools(applyMiddleware(...middlewares))];
  const store = createStore(rootReducer, initialState, compose(...enhancers));
  return store;
};

export default getStore;
