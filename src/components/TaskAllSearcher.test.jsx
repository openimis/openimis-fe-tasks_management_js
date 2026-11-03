import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render } from '@testing-library/react';
import {
  describe, it, expect, vi,
} from 'vitest';

const searcherProps = vi.fn();

vi.mock('@openimis/fe-core', () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  useTranslations: () => ({
    formatMessage: (key) => key,
    formatMessageWithValues: (key) => key,
    formatDateTimeFromISO: (value) => value,
  }),
  useModulesManager: () => ({ getRef: (ref) => ref }),
  useHistory: () => ({ push: vi.fn() }),
  historyPush: vi.fn(),
  // Records what TaskAllSearcher hands to the generic searcher.
  Searcher: function Searcher(props) {
    searcherProps(props);
    return null;
  },
}));

vi.mock('../actions', () => ({
  fetchTasks: vi.fn(() => ({ type: 'FETCH_TASKS' })),
}));

const { default: TaskAllSearcher } = await import('./TaskAllSearcher');

const renderSearcher = (props) => {
  const store = createStore((state = { tasksManagement: { tasks: [] } }) => state);
  render(
    <Provider store={store}>
      <TaskAllSearcher rights={[]} {...props} />
    </Provider>,
  );
  return searcherProps.mock.calls.at(-1)[0].defaultFilters;
};

describe('TaskAllSearcher default filters', () => {
  it('filters on the given entities', () => {
    expect(renderSearcher({ entityIds: ['e1'] }).entityIds).toEqual({
      value: ['e1'],
      filter: 'entityIds: ["e1"]',
    });
  });

  it('adds no entity filter without entities', () => {
    expect(renderSearcher({}).entityIds).toBeUndefined();
  });
});
