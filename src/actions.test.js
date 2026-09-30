import {
  describe, expect, it, vi,
} from 'vitest';

// Only fe-core's two dispatchers are stubbed; the formatters are real, imported from
// their defining module because fe-core's barrel imports itself.
const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  graphqlWithVariables: vi.fn((operation, variables, type, meta) => ({
    operation, variables, type, meta,
  })),
}));

vi.mock('@openimis/fe-core', async () => ({
  ...(await vi.importActual('@openimis/fe-core/helpers/api')),
  ...core,
}));

const actions = await import('./actions');
const { default: reducer, ACTION_TYPE } = await import('./reducer');
const {
  CLEAR, ERROR, REQUEST, SUCCESS,
} = await import('./utils/action-type');
const { globalId, graphqlErrors, relayPage } = await import('@openimis/fe-core/testing');

const modulesManager = {};
const UUID = '35f1cd0c-4a5f-4b7b-9b8f-8a0d0f1b2c3d';

const query = (result) => result.payload.replace(/\s+/g, ' ');
const operation = (result) => result.operation.replace(/\s+/g, ' ');
const input = (text) => text.replace(/\s+/g, ' ').trim();

describe('tasks management actions', () => {
  describe('searches', () => {
    it.each([
      ['task groups', 'fetchTaskGroups', ACTION_TYPE.SEARCH_TASK_GROUPS, 'taskGroup',
        'taskexecutorSet { edges { node { user { id username lastName } } } }'],
      ['tasks', 'fetchTasks', ACTION_TYPE.SEARCH_TASKS, 'task', 'taskGroup{id, code, completionPolicy}'],
      ['task history', 'fetchTaskHistory', ACTION_TYPE.SEARCH_TASK_HISTORY, 'taskHistory', 'version,dateUpdated'],
      ['one task', 'fetchTask', ACTION_TYPE.GET_TASK, 'task', 'flow{id, uuid, code},currentStep{id, uuid, order}'],
      ['task flows', 'fetchTaskFlows', ACTION_TYPE.SEARCH_TASK_FLOWS, 'taskFlow', 'name,stepCount'],
      ['task decisions', 'fetchTaskDecisions', ACTION_TYPE.SEARCH_TASK_DECISIONS, 'taskDecision',
        'flowStep{id, uuid, order, taskGroup{id, code}}'],
    ])('asks for a counted page of %s', (_label, creator, actionType, entity, fragment) => {
      const result = actions[creator](modulesManager, ['first: 10', 'isDeleted: false']);

      expect(result.type).toBe(actionType);
      expect(query(result)).toContain(`${entity}(first: 10,isDeleted: false) { totalCount`);
      expect(query(result)).toContain(fragment);
    });

    it('asks for the business data only when loading one task', () => {
      expect(query(actions.fetchTask(modulesManager, ['id: "task-1"']))).toContain('businessData');
      expect(query(actions.fetchTasks(modulesManager, []))).not.toContain('businessData');
    });

    it('loads one task group by uuid with its sources and executors', () => {
      const result = actions.fetchTaskGroup(modulesManager, { taskGroupUuid: 'group-1' });

      expect(result.type).toBe(ACTION_TYPE.GET_TASK_GROUP);
      expect(result.variables).toEqual({ taskGroupUuid: 'group-1' });
      expect(operation(result)).toContain('taskGroup(id: $taskGroupUuid)');
      expect(operation(result)).toContain('jsonExt');
      expect(operation(result)).toContain('taskexecutorSet { edges { node { user { id username lastName } } } }');
    });

    it('loads one task flow with its steps and their groups', () => {
      const result = actions.fetchTaskFlow(modulesManager, { taskFlowUuid: 'flow-1' });

      expect(result.type).toBe(ACTION_TYPE.GET_TASK_FLOW);
      expect(operation(result))
        .toContain('taskFlow(id: $taskFlowUuid, code: $code, showSuperseded: $showSuperseded)');
      expect(operation(result)).toContain('taskGroup { id uuid code completionPolicy threshold');
    });

    it.each([
      ['by id includes superseded versions', { taskFlowUuid: 'flow-1' }, true],
      ['by code looks up only the current head', { code: 'F1' }, false],
      ['with no variables includes superseded versions', undefined, true],
      ['can be told explicitly not to include superseded versions',
        { taskFlowUuid: 'flow-1', showSuperseded: false }, false],
    ])('a flow lookup %s', (_label, variables, showSuperseded) => {
      expect(actions.fetchTaskFlow(modulesManager, variables).variables.showSuperseded).toBe(showSuperseded);
    });
  });

  describe('clearing state', () => {
    it.each([
      ['clearTaskGroup', CLEAR(ACTION_TYPE.GET_TASK_GROUP)],
      ['clearTask', CLEAR(ACTION_TYPE.GET_TASK)],
      ['clearTaskFlow', CLEAR(ACTION_TYPE.GET_TASK_FLOW)],
    ])('%s dispatches a single plain action', (creator, type) => {
      const dispatch = vi.fn();

      actions[creator]()(dispatch);

      expect(dispatch).toHaveBeenCalledExactlyOnceWith({ type });
    });
  });

  describe('mutations', () => {
    const group = { id: globalId('TaskGroupGQLType', 'group-1'), code: 'G1', completionPolicy: 'ALL' };
    const flow = { uuid: 'flow-1', id: globalId('TaskFlowGQLType', 'flow-1'), code: 'F1', name: 'Flow' };

    it.each([
      ['createTaskGroup', () => actions.createTaskGroup(group, 'label'), 'createTaskGroup', ACTION_TYPE.CREATE_TASK_GROUP],
      ['updateTaskGroup', () => actions.updateTaskGroup(group, 'label'), 'updateTaskGroup', ACTION_TYPE.UPDATE_TASK_GROUP],
      ['deleteTaskGroup', () => actions.deleteTaskGroup(group, 'label'), 'deleteTaskGroup', ACTION_TYPE.DELETE_TASK_GROUP],
      ['updateTask', () => actions.updateTask({ id: 'task-1' }, 'label'), 'updateTask', ACTION_TYPE.UPDATE_TASK],
      ['resolveTask', () => actions.resolveTask({ id: 'task-1' }, 'label'), 'resolveTask', ACTION_TYPE.RESOLVE_TASK],
      ['createTaskFlow', () => actions.createTaskFlow(flow, 'label'), 'createTaskFlow', ACTION_TYPE.CREATE_TASK_FLOW],
      ['updateTaskFlow', () => actions.updateTaskFlow(flow, 'label'), 'updateTaskFlow', ACTION_TYPE.UPDATE_TASK_FLOW],
      ['replaceTaskFlow', () => actions.replaceTaskFlow(flow, 'label'), 'replaceTaskFlow', ACTION_TYPE.REPLACE_TASK_FLOW],
      ['deleteTaskFlow', () => actions.deleteTaskFlow(flow, 'label'), 'deleteTaskFlow', ACTION_TYPE.DELETE_TASK_FLOW],
    ])('%s calls its own mutation and raises the shared request and error types', (
      _label,
      create,
      mutationName,
      actionType,
    ) => {
      const result = create();

      expect(query(result)).toContain(`mutation ${mutationName} { ${mutationName}( input: {`);
      expect(result.type).toEqual([
        REQUEST(ACTION_TYPE.MUTATION),
        SUCCESS(actionType),
        ERROR(ACTION_TYPE.MUTATION),
      ]);
      expect(result.meta).toMatchObject({ actionType, clientMutationLabel: 'label' });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
    });

    it('reports the same client mutation id it sent', () => {
      const result = actions.updateTask({ id: 'task-1' }, 'Update task');

      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
      expect(query(result)).toContain('clientMutationLabel: "Update task"');
    });

    it('deletes a task group by its decoded uuid', () => {
      expect(query(actions.deleteTaskGroup(group, 'label'))).toContain('ids: ["group-1"]');
    });

    it.each([
      ['its uuid', { uuid: 'flow-1', id: globalId('TaskFlowGQLType', 'other') }, 'flow-1'],
      ['its decoded global id', { id: globalId('TaskFlowGQLType', 'flow-2') }, 'flow-2'],
      ['a plain uuid id', { id: UUID }, UUID],
    ])('deletes a task flow by %s', (_label, target, expected) => {
      expect(query(actions.deleteTaskFlow(target, 'label'))).toContain(`ids: ["${expected}"]`);
    });

    it('sends steps when creating and replacing a flow but never when updating one', () => {
      const withSteps = { ...flow, steps: [{ taskGroup: { uuid: 'group-1' } }] };

      expect(query(actions.createTaskFlow(withSteps, 'label'))).toContain('steps: [');
      expect(query(actions.replaceTaskFlow(withSteps, 'label'))).toContain('steps: [');
      expect(query(actions.updateTaskFlow(withSteps, 'label'))).not.toContain('steps:');
    });
  });

  describe('formatTaskGroupGQL', () => {
    it('sends the code, policy, id, executor uuids and source names', () => {
      const sent = input(actions.formatTaskGroupGQL({
        id: 'group-1',
        code: 'G1',
        completionPolicy: 'ANY',
        taskexecutorSet: [{ id: globalId('UserGQLType', 'user-1') }, { id: globalId('UserGQLType', 'user-2') }],
        taskSources: [{ id: 'payroll', name: 'payroll' }, { id: 'import_valid_items', name: 'import_valid_items' }],
      }));

      expect(sent).toBe('code: "G1" completionPolicy: ANY id: "group-1" userIds: ["user-1", "user-2"] '
        + 'taskSources: ["payroll", "import_valid_items"]');
    });

    it('sends empty executor and source lists for a bare group', () => {
      expect(input(actions.formatTaskGroupGQL({ code: 'G1' }))).toBe('code: "G1" userIds: [] taskSources: []');
      expect(input(actions.formatTaskGroupGQL(undefined))).toBe('userIds: [] taskSources: []');
    });

    // Currently fails: fe-core's formatGQLString escapes quotes before backslashes, so the
    // backslash it just added is doubled and the quote ends the GraphQL string early.
    it.fails('escapes quotes in the code', () => {
      expect(actions.formatTaskGroupGQL({ code: 'say "hi"' })).toContain('code: "say \\"hi\\""');
    });
  });

  describe('formatTaskGQL', () => {
    it('pins a task to a flow by its uuid and nothing else', () => {
      const sent = input(actions.formatTaskGQL({
        id: 'task-1',
        taskGroup: { id: globalId('TaskGroupGQLType', 'group-1') },
        assignment: { kind: 'FLOW', uuid: 'flow-1' },
      }));

      expect(sent).toBe('id: "task-1" flowId: "flow-1"');
    });

    it('accepts a task into the group it is assigned to', () => {
      const sent = input(actions.formatTaskGQL({ id: 'task-1', assignment: { kind: 'GROUP', uuid: 'group-2' } }));

      expect(sent).toBe('id: "task-1" status: ACCEPTED taskGroupId: "group-2"');
    });

    it('detaches the flow when a flow task is moved back to a plain group', () => {
      const sent = input(actions.formatTaskGQL({
        id: 'task-1',
        flow: { id: 'flow-1' },
        assignment: { kind: 'GROUP', uuid: 'group-2' },
      }));

      expect(sent).toBe('id: "task-1" status: ACCEPTED taskGroupId: "group-2" detachFlow: true');
    });

    it('falls back to the current group, decoded, when no assignment was picked', () => {
      const sent = input(actions.formatTaskGQL({
        id: 'task-1',
        flow: { id: 'flow-1' },
        taskGroup: { id: globalId('TaskGroupGQLType', 'group-1') },
      }));

      expect(sent).toBe('id: "task-1" status: ACCEPTED taskGroupId: "group-1"');
    });

    it('sends only the id when the task has no group at all', () => {
      expect(input(actions.formatTaskGQL({ id: 'task-1' }))).toBe('id: "task-1"');
    });
  });

  describe('formatTaskResolveGQL', () => {
    const task = { id: 'task-1' };
    const user = { id: 'user-1' };

    it.each(['APPROVED', 'FAILED'])('records a %s decision against the deciding user', (decision) => {
      expect(input(actions.formatTaskResolveGQL(task, user, decision)))
        .toBe(`id: "task-1" businessStatus: "{\\"user-1\\": \\"${decision}\\"}"`);
    });

    it('passes the additional data through as the caller escaped it', () => {
      const additionalData = '{\\"values\\": {}}';

      expect(actions.formatTaskResolveGQL(task, user, 'APPROVED', additionalData))
        .toContain('additionalData: "{\\"values\\": {}}"');
    });

    it('sends no decision without both a user and a choice', () => {
      expect(input(actions.formatTaskResolveGQL(task, null, 'APPROVED'))).toBe('id: "task-1"');
      expect(input(actions.formatTaskResolveGQL(task, user, undefined))).toBe('id: "task-1"');
    });

    it('is what resolveTask sends', () => {
      const sent = query(actions.resolveTask(task, 'label', user, 'APPROVED', 'extra'));

      expect(sent).toContain('businessStatus: "{\\"user-1\\": \\"APPROVED\\"}"');
      expect(sent).toContain('additionalData: "extra"');
    });
  });

  describe('decodeIdIfEncoded', () => {
    it.each([
      ['a dashed uuid unchanged', UUID, UUID],
      ['a global id decoded', globalId('TaskGroupGQLType', 'group-1'), 'group-1'],
      ['a numeric id unchanged', '42', '42'],
      ['something that is not base64 unchanged', '%%%', '%%%'],
    ])('returns %s', (_label, value, expected) => {
      expect(actions.decodeIdIfEncoded(value)).toBe(expected);
    });
  });

  describe('formatTaskFlowGQL', () => {
    it('sends the id, code, name, source names and steps in list order', () => {
      const sent = input(actions.formatTaskFlowGQL({
        uuid: 'flow-1',
        id: globalId('TaskFlowGQLType', 'flow-1'),
        code: 'F1',
        name: 'Payroll approval',
        taskSources: [{ id: 'payroll', name: 'payroll' }, 'payroll_reject'],
        steps: [
          { taskGroup: { uuid: 'group-1' } },
          { taskGroup: { id: globalId('TaskGroupGQLType', 'group-2') }, completionPolicy: 'N', threshold: 2 },
        ],
      }));

      expect(sent).toBe('id: "flow-1" code: "F1" name: "Payroll approval" '
        + 'taskSources: ["payroll", "payroll_reject"] '
        + 'steps: [{taskGroupId: "group-1"}, {taskGroupId: "group-2", completionPolicy: N, threshold: 2}]');
    });

    it('decodes the flow id when there is no uuid', () => {
      expect(actions.formatTaskFlowGQL({ id: globalId('TaskFlowGQLType', 'flow-2') })).toContain('id: "flow-2"');
    });

    it('leaves the id and name out of a new flow', () => {
      const sent = input(actions.formatTaskFlowGQL({ code: 'F1' }));

      expect(sent).toBe('code: "F1" taskSources: []');
    });

    it('sends a name cleared to empty so the backend clears it too', () => {
      expect(actions.formatTaskFlowGQL({ id: UUID, name: '' })).toContain('name: ""');
    });

    // Currently fails: fe-core's formatGQLString escapes quotes before backslashes, so the
    // backslash it just added is doubled and the quote ends the GraphQL string early.
    it.fails('escapes quotes in the code and name', () => {
      const sent = actions.formatTaskFlowGQL({ code: 'a"b', name: 'c"d' });

      expect(sent).toContain('code: "a\\"b"');
      expect(sent).toContain('name: "c\\"d"');
    });

    it('can leave the steps out', () => {
      const sent = actions.formatTaskFlowGQL({ code: 'F1', steps: [{ taskGroup: { uuid: 'group-1' } }] }, false);

      expect(sent).not.toContain('steps');
    });

    it('sends an empty step list as an empty list', () => {
      expect(actions.formatTaskFlowGQL({ code: 'F1', steps: [] })).toContain('steps: []');
    });
  });

  describe('fetchAllTaskDecisions', () => {
    const PAGE_TYPE = 'TASK_MANAGEMENT_TASK_DECISIONS_PAGE';
    const decision = (n) => ({ id: `d-${n}`, decision: 'APPROVED' });
    const page = (nodes, { hasNextPage = false, endCursor = null, totalCount } = {}) => ({
      payload: { data: { taskDecision: relayPage(nodes, { totalCount, pageInfo: { hasNextPage, endCursor } }) } },
    });

    // Stands in for redux: page queries resolve to the queued responses, plain actions are recorded.
    const store = (...responses) => {
      const queue = [...responses];
      const dispatched = [];
      const pageQueries = [];
      const dispatch = vi.fn((action) => {
        if (action.type === PAGE_TYPE) {
          pageQueries.push(action.payload.replace(/\s+/g, ' '));
          const next = queue.shift();
          return typeof next === 'function' ? next() : Promise.resolve(next);
        }
        dispatched.push(action);
        return action;
      });
      return { dispatch, dispatched, pageQueries };
    };

    const params = ['taskId: "task-1"', 'isDeleted: false'];

    it('fetches a single page and hands the reducer one combined result', async () => {
      const { dispatch, dispatched, pageQueries } = store(page([decision(1), decision(2)]));

      await actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);

      expect(pageQueries).toHaveLength(1);
      expect(pageQueries[0]).toContain('taskDecision(taskId: "task-1",isDeleted: false) { totalCount');
      expect(dispatched).toEqual([
        { type: REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS), meta: { taskId: 'task-1' } },
        {
          type: SUCCESS(ACTION_TYPE.SEARCH_TASK_DECISIONS),
          payload: {
            data: {
              taskDecision: {
                totalCount: 2,
                edges: [{ node: decision(1) }, { node: decision(2) }],
                pageInfo: { hasNextPage: false },
              },
            },
          },
          meta: { taskId: 'task-1' },
        },
      ]);
    });

    it('walks every page by cursor and concatenates them in order', async () => {
      const { dispatch, dispatched, pageQueries } = store(
        page([decision(1)], { hasNextPage: true, endCursor: 'c1', totalCount: 3 }),
        page([decision(2)], { hasNextPage: true, endCursor: 'c2', totalCount: 3 }),
        page([decision(3)], { totalCount: 3 }),
      );

      await actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);

      expect(pageQueries.map((sent) => sent.match(/taskDecision\(([^)]*)\)/)[1])).toEqual([
        'taskId: "task-1",isDeleted: false',
        'taskId: "task-1",isDeleted: false,after: "c1"',
        'taskId: "task-1",isDeleted: false,after: "c2"',
      ]);
      const result = dispatched.at(-1);
      expect(result.type).toBe(SUCCESS(ACTION_TYPE.SEARCH_TASK_DECISIONS));
      expect(result.payload.data.taskDecision.edges.map((edge) => edge.node.id)).toEqual(['d-1', 'd-2', 'd-3']);
      expect(result.payload.data.taskDecision.totalCount).toBe(3);
    });

    it('leaves the caller params untouched', async () => {
      const original = [...params];
      const { dispatch } = store(page([decision(1)], { hasNextPage: true, endCursor: 'c1' }), page([decision(2)]));

      await actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);

      expect(params).toEqual(original);
    });

    it('reports a transport failure of any page instead of a partial ledger', async () => {
      const failure = { error: true, payload: { status: 502, statusText: 'Bad Gateway' } };
      const { dispatch, dispatched } = store(page([decision(1)], { hasNextPage: true, endCursor: 'c1' }), failure);

      await actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);

      expect(dispatched.at(-1)).toEqual({
        type: ERROR(ACTION_TYPE.SEARCH_TASK_DECISIONS),
        payload: failure.payload,
        meta: { taskId: 'task-1' },
      });
      expect(reducer(undefined, dispatched.at(-1)).errorTaskDecisions)
        .toEqual({ code: 502, message: 'Bad Gateway', detail: null });
    });

    // Currently fails: a page that comes back with GraphQL errors is dispatched as ERROR,
    // whose reducer case reads it with formatServerError - so the messages are dropped
    // and the decisions panel shows an error with no code, message or detail.
    it.fails('reports why a decision page came back with data errors', async () => {
      const { dispatch, dispatched } = store({
        payload: { data: { taskDecision: null }, ...graphqlErrors('permission denied') },
      });

      await actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);

      expect(reducer(undefined, dispatched.at(-1)).errorTaskDecisions)
        .toMatchObject({ detail: 'permission denied' });
    });

    it('drops the result of a walk overtaken by a newer one', async () => {
      let releaseOld;
      const oldPage = new Promise((resolve) => { releaseOld = resolve; });
      const { dispatch, dispatched } = store(() => oldPage, page([decision(2)]));

      const older = actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);
      await actions.fetchAllTaskDecisions(['taskId: "task-2"'], 'task-2')(dispatch);
      releaseOld(page([decision(1)]));
      await older;

      expect(dispatched.map((action) => [action.type, action.meta.taskId])).toEqual([
        [REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS), 'task-1'],
        [REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS), 'task-2'],
        [SUCCESS(ACTION_TYPE.SEARCH_TASK_DECISIONS), 'task-2'],
      ]);
    });

    it('stops walking an overtaken ledger rather than fetching its remaining pages', async () => {
      let releaseOld;
      const oldPage = new Promise((resolve) => { releaseOld = resolve; });
      const { dispatch, pageQueries } = store(() => oldPage, page([decision(9)]));

      const older = actions.fetchAllTaskDecisions(params, 'task-1')(dispatch);
      await actions.fetchAllTaskDecisions(['taskId: "task-2"'], 'task-2')(dispatch);
      releaseOld(page([decision(1)], { hasNextPage: true, endCursor: 'c1' }));
      await older;

      expect(pageQueries).toHaveLength(2);
    });
  });
});
