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
  // Records what TaskSearcher hands to the generic searcher.
  Searcher: function Searcher(props) {
    searcherProps(props);
    return null;
  },
}));

vi.mock('../actions', () => ({
  fetchTasks: vi.fn(() => ({ type: 'FETCH_TASKS' })),
}));

const { default: TaskSearcher } = await import('./TaskSearcher');

const renderSearcher = (props) => {
  const store = createStore((state = { tasksManagement: { tasks: [] } }) => state);
  render(
    <Provider store={store}>
      <TaskSearcher rights={[]} {...props} />
    </Provider>,
  );
  return searcherProps.mock.calls.at(-1)[0].defaultFilters;
};

describe('TaskSearcher default filters', () => {
  it('filters on the group on the server when given a groupId (OP-3274)', () => {
    const filters = renderSearcher({ groupId: 'group-uuid' });

    expect(filters.groupId).toEqual({ value: 'group-uuid', filter: 'groupId: "group-uuid"' });
    expect(filters.entityIds).toBeUndefined();
  });

  it('still filters on an entity and on a list of entities', () => {
    expect(renderSearcher({ entityId: 'e1' }).entityId.filter).toBe('entityId: "e1"');
    expect(renderSearcher({ entityIds: ['e1', 'e2'] }).entityIds.filter).toBe('entityIds: ["e1","e2"]');
  });

  it('adds no group filter without a groupId', () => {
    expect(renderSearcher({}).groupId).toBeUndefined();
  });
});
