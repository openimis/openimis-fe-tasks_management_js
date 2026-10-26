import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render } from '@testing-library/react';
import {
  describe, it, expect, vi,
} from 'vitest';

const searcherProps = vi.fn();
const location = { current: { search: '' } };

vi.mock('@openimis/fe-core', () => ({
  useLocation: () => location.current,
}));

vi.mock('../components/TaskAllSearcher', () => ({
  default: function TaskAllSearcher(props) {
    searcherProps(props);
    return null;
  },
}));

const { default: TasksAllPage } = await import('./TasksAllPage');
const { RIGHT_TASKS_MANAGEMENT_SEARCH } = await import('../constants');

const renderPage = (search) => {
  location.current = { search };
  const store = createStore(() => ({ core: { user: { i_user: { rights: [RIGHT_TASKS_MANAGEMENT_SEARCH] } } } }));
  render(
    <Provider store={store}>
      <TasksAllPage />
    </Provider>,
  );
  return searcherProps.mock.calls.at(-1)[0];
};

describe('TasksAllPage', () => {
  it('prefilters the list on the entity given in the address', () => {
    expect(renderPage('?entityIds=entity-uuid').entityIds).toEqual(['entity-uuid']);
  });

  it('lists every task without an entity in the address', () => {
    expect(renderPage('').entityIds).toBeUndefined();
  });
});
