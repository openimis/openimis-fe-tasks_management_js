import {
  describe, it, expect, vi,
} from 'vitest';

vi.mock('@openimis/fe-core', () => ({
  decodeId: (id) => id,
  formatGQLString: (s) => s,
  formatMutation: vi.fn((type, input, label) => ({ payload: `${type}(${input})`, clientMutationId: 'cm-1', label })),
  formatPageQueryWithCount: vi.fn(),
  graphql: vi.fn(() => ({ type: 'GRAPHQL' })),
  graphqlWithVariables: vi.fn(),
}));

const { graphql, formatMutation } = await import('@openimis/fe-core');
const { resolveTask } = await import('./actions');

const TASK = { id: 'task-1' };
const USER = { id: 'user-1' };

describe('resolveTask', () => {
  it('sends no mutation when there is no outcome', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    resolveTask(TASK, 'Resolving task', USER, '');
    resolveTask(TASK, 'Resolving task', USER, null);
    resolveTask(TASK, 'Resolving task', null, 'APPROVED');

    expect(graphql).not.toHaveBeenCalled();
  });

  it('sends the outcome as businessStatus keyed by the resolving user', () => {
    resolveTask(TASK, 'Resolving task', USER, 'APPROVED');

    expect(graphql).toHaveBeenCalledTimes(1);
    const input = formatMutation.mock.calls[0][1];
    expect(input).toContain('id: "task-1"');
    expect(input).toContain('businessStatus: "{\\"user-1\\": \\"APPROVED\\"}"');
  });
});
