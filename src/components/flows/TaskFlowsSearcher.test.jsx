import React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import {
  render, screen, fireEvent, act,
} from '@testing-library/react';
import {
  describe, it, expect, vi,
} from 'vitest';

vi.mock('@openimis/fe-core', () => ({
  GetIconComponent: (name) => function Icon() { return <span>{name}</span>; },
  useTranslations: () => ({ formatMessage: (key) => key, formatMessageWithValues: (key) => key }),
  useModulesManager: () => ({ getRef: (ref) => ref }),
  useHistory: () => ({ push: vi.fn() }),
  coreConfirm: vi.fn(() => ({ type: 'CORE_CONFIRM' })),
  clearConfirm: vi.fn(() => ({ type: 'CORE_CONFIRM_CLEAR' })),
  journalize: vi.fn(() => ({ type: 'JOURNALIZE' })),
  // One row per item, each cell from the module's formatters.
  Searcher: function Searcher({ items, itemFormatters, rowDisabled }) {
    return (
      <table>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} data-testid={`row-${item.id}`} data-disabled={String(!!rowDisabled(null, item))}>
              {itemFormatters().map((format, i) => <td key={i}>{format(item)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock('../../actions', () => ({
  fetchTaskFlows: vi.fn(() => ({ type: 'FETCH_TASK_FLOWS' })),
  deleteTaskFlow: vi.fn(() => ({ type: 'DELETE_TASK_FLOW' })),
}));

const { coreConfirm } = await import('@openimis/fe-core');
const { deleteTaskFlow } = await import('../../actions');
const { default: TaskFlowsSearcher } = await import('./TaskFlowsSearcher');
const { TASK_FLOW_DELETE } = await import('../../constants');

const FLOW_A = { id: 'flow-a', uuid: 'a', code: 'A' };

const thunk = ({ dispatch, getState }) => (next) => (action) => (
  typeof action === 'function' ? action(dispatch, getState) : next(action));

// `SET_CONFIRMED` stands in for any other dialog in the app being answered.
const coreReducer = (state = { confirmed: null }, action) => (
  action.type === 'SET_CONFIRMED' ? { ...state, confirmed: action.payload } : state);

const renderSearcher = ({ confirmed = null } = {}) => {
  const store = createStore(
    combineReducers({
      core: coreReducer,
      tasksManagement: (state = { taskFlows: [FLOW_A], submittingMutation: false }) => state,
    }),
    { core: { confirmed } },
    applyMiddleware(thunk),
  );
  render(
    <Provider store={store}>
      <TaskFlowsSearcher rights={[TASK_FLOW_DELETE]} />
    </Provider>,
  );
  return store;
};

const clickDelete = () => fireEvent.click(screen.getByText('Delete').closest('button'));
const lastConfirmOptions = () => coreConfirm.mock.calls.at(-1)?.[2];

describe('TaskFlowsSearcher delete', () => {
  it('deletes once and greys the row when its own dialog is confirmed', () => {
    renderSearcher();

    clickDelete();
    expect(deleteTaskFlow).not.toHaveBeenCalled();
    act(() => lastConfirmOptions().onConfirm());

    expect(deleteTaskFlow).toHaveBeenCalledTimes(1);
    expect(deleteTaskFlow.mock.calls[0][0]).toEqual(FLOW_A);
    expect(screen.getByTestId('row-flow-a').dataset.disabled).toBe('true');
  });

  it('does not delete when another dialog in the app is answered "Yes"', () => {
    const store = renderSearcher();

    clickDelete();
    act(() => { store.dispatch({ type: 'SET_CONFIRMED', payload: true }); });

    expect(deleteTaskFlow).not.toHaveBeenCalled();
  });

  it('does not delete on mount when a stale "Yes" is already in the store', () => {
    renderSearcher({ confirmed: true });

    expect(deleteTaskFlow).not.toHaveBeenCalled();
    expect(coreConfirm).not.toHaveBeenCalled();
  });
});
