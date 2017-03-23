import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

jest.mock('WcaApi', () => {
  return {
    me() {
      return Promise.resolve({
        name: "Jeremy",
      });
    },
    getUpcomingManageableCompetitions() {
      return Promise.resolve([]);
    },
  };
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
