import React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';

const { contribs } = vi.hoisted(() => ({ contribs: [] }));

vi.mock('@openimis/fe-core', () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  useTranslations: () => ({ formatMessage: (key) => key }),
  useModulesManager: () => ({ getContribs: () => contribs }),
  coreConfirm: vi.fn(() => ({ type: 'CORE_CONFIRM' })),
  clearConfirm: vi.fn(() => ({ type: 'CORE_CONFIRM_CLEAR' })),
  journalize: vi.fn(() => ({ type: 'JOURNALIZE' })),
  decodeId: (id) => id,
}));

vi.mock('../actions', () => ({
  resolveTask: vi.fn(() => ({ type: 'RESOLVE_TASK' })),
}));

const { coreConfirm } = await import('@openimis/fe-core');
const { resolveTask } = await import('../actions');
const { default: TaskApprovementPanel } = await import('./TaskApprovementPanel');

const USER = { id: 'user-1' };
const ACCEPTED_TASK = { id: 'task-1', status: 'ACCEPTED', source: null };

// Thunks are resolved inline; the panel only needs dispatch to accept them.
const thunk = ({ dispatch, getState }) => (next) => (action) => (
  typeof action === 'function' ? action(dispatch, getState) : next(action));

const makeTestStore = (core) => createStore(
  combineReducers({
    core: (state = core) => state,
    tasksManagement: (state = { submittingMutation: false }) => state,
  }),
  applyMiddleware(thunk),
);

const renderPanel = ({ core, edited = ACCEPTED_TASK, additionalData = null }) => {
  const store = makeTestStore(core);
  const view = render(
    <Provider store={store}>
      <TaskApprovementPanel edited={edited} additionalData={additionalData} />
    </Provider>,
  );
  return { store, ...view };
};

// The options argument coreConfirm was last called with.
const lastConfirmOptions = () => coreConfirm.mock.calls.at(-1)?.[2];

describe('TaskApprovementPanel', () => {
  beforeEach(() => {
    contribs.length = 0;
  });

  it('does not resolve the task on mount when another dialog already answered "Yes"', () => {
    // A group delete confirmed elsewhere leaves state.core.confirmed === true.
    renderPanel({ core: { confirmed: true, user: USER } });

    expect(resolveTask).not.toHaveBeenCalled();
  });

  it('does not resolve when a Received task is saved and comes back Accepted', () => {
    const { rerender, store } = renderPanel({
      core: { confirmed: true, user: USER },
      edited: { ...ACCEPTED_TASK, status: 'RECEIVED' },
    });
    rerender(
      <Provider store={store}>
        <TaskApprovementPanel edited={ACCEPTED_TASK} />
      </Provider>,
    );

    expect(resolveTask).not.toHaveBeenCalled();
  });

  it('resolves exactly once, with the chosen outcome, when its own dialog is confirmed', () => {
    renderPanel({ core: { confirmed: null, user: USER }, additionalData: 'extra' });

    fireEvent.click(screen.getByText('Check').closest('button'));
    expect(resolveTask).not.toHaveBeenCalled();

    lastConfirmOptions().onConfirm();

    expect(resolveTask).toHaveBeenCalledTimes(1);
    expect(resolveTask).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1' }),
      'task.resolve.mutationLabel',
      USER,
      'APPROVED',
      'extra',
    );
  });

  it('does not resolve when its own dialog is cancelled', () => {
    renderPanel({ core: { confirmed: null, user: USER } });

    fireEvent.click(screen.getByText('Clear').closest('button'));
    lastConfirmOptions().onCancel?.();

    expect(resolveTask).not.toHaveBeenCalled();
  });

  it('resolves with the outcome a contributed confirmation panel passes', () => {
    let defaultAction;
    contribs.push({
      taskSource: ['import_group'],
      confirmationPanel: (props) => {
        defaultAction = props.defaultAction;
        return null;
      },
    });
    renderPanel({
      core: { confirmed: true, user: USER },
      edited: { ...ACCEPTED_TASK, source: 'import_group' },
    });
    expect(resolveTask).not.toHaveBeenCalled();

    defaultAction('FAILED');
    lastConfirmOptions().onConfirm();

    expect(resolveTask).toHaveBeenCalledTimes(1);
    expect(resolveTask.mock.calls[0][3]).toBe('FAILED');
  });
});
