import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { MemoryRouter } from 'react-router';

jest.mock('./etched-api');

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
    div
  );
});
