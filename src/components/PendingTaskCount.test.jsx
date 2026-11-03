import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';

const queryState = { current: { isLoading: false, data: null, error: null } };
const useGraphqlQuery = vi.fn(() => queryState.current);
const historyPush = vi.fn();

vi.mock('@openimis/fe-core', () => ({
  useGraphqlQuery: (...args) => useGraphqlQuery(...args),
  useTranslations: () => ({
    formatMessage: (key) => key,
    formatMessageWithValues: (key, values) => `${key} ${JSON.stringify(values)}`,
  }),
  useModulesManager: () => ({ getRef: (ref) => ref }),
  useHistory: () => ({ push: vi.fn() }),
  historyPush: (...args) => historyPush(...args),
}));

const { default: PendingTaskCount } = await import('./PendingTaskCount');
const { RIGHT_TASKS_MANAGEMENT_SEARCH } = await import('../constants');

const answer = (pendingTaskCount) => {
  queryState.current = { isLoading: false, data: { pendingTaskCount }, error: null };
};

const renderCount = (props = {}, rights = []) => {
  const store = createStore(() => ({ core: { user: { i_user: { rights } } } }));
  return render(
    <Provider store={store}>
      <PendingTaskCount entityType="individual.individual" entityId="entity-uuid" {...props} />
    </Provider>,
  );
};

describe('PendingTaskCount', () => {
  beforeEach(() => {
    queryState.current = { isLoading: false, data: null, error: null };
  });

  it('asks the backend for the pending tasks of the entity', () => {
    answer(0);
    renderCount();

    const [query, variables, config] = useGraphqlQuery.mock.calls.at(-1);
    expect(query).toContain('pendingTaskCount(entityType: $entityType, entityId: $entityId)');
    expect(variables).toEqual({ entityType: 'individual.individual', entityId: 'entity-uuid' });
    expect(config.skip).toBe(false);
  });

  it('does not query without an entity', () => {
    renderCount({ entityId: null });

    expect(useGraphqlQuery.mock.calls.at(-1)[2].skip).toBe(true);
  });

  it('shows nothing when no task is pending', () => {
    answer(0);
    const { container } = renderCount();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing when the entity cannot be read', () => {
    answer(null);
    const { container } = renderCount();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the number of pending tasks', () => {
    answer(2);
    renderCount();

    expect(screen.getByText('pendingTaskCount.label {"count":2}')).toBeInTheDocument();
  });

  it('opens the task list filtered on the entity for a user who may search tasks', () => {
    answer(1);
    renderCount({}, [RIGHT_TASKS_MANAGEMENT_SEARCH]);

    fireEvent.click(screen.getByRole('button'));

    expect(historyPush).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'tasksManagement.route.allTasks',
      [],
      false,
      '?entityIds=entity-uuid',
    );
  });

  it('is not clickable without the task search right', () => {
    answer(1);
    renderCount({}, []);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('pendingTaskCount.label {"count":1}'));
    expect(historyPush).not.toHaveBeenCalled();
  });

  it('reports a blocking result while a task is pending', () => {
    answer(2);
    const onResult = vi.fn();
    renderCount({ onResult });

    expect(onResult).toHaveBeenLastCalledWith({
      key: 'pendingTask', blocking: true, count: 2, loading: false,
    });
  });

  it('reports a non-blocking result when no task is pending', () => {
    answer(0);
    const onResult = vi.fn();
    renderCount({ onResult });

    expect(onResult).toHaveBeenLastCalledWith({
      key: 'pendingTask', blocking: false, count: 0, loading: false,
    });
  });

  it('reports that it has not answered yet while loading', () => {
    queryState.current = { isLoading: true, data: null, error: null };
    const onResult = vi.fn();
    renderCount({ onResult });

    expect(onResult).toHaveBeenLastCalledWith({
      key: 'pendingTask', blocking: false, count: null, loading: true,
    });
  });
});
