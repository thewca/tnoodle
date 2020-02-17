import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { Provider } from "react-redux";
import store from "./redux/Store";

test('renders login link', () => {
  const { getByText } = render(<Provider store={store}><App /></Provider>);
  const linkElement = getByText(/Log in/i);
  expect(linkElement).toBeInTheDocument();
});
