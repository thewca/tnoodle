import createHistory from 'history/createBrowserHistory';

import { BASE_PATH } from './components/App';

const history = createHistory({
  basename: BASE_PATH
});

export default history;
