import {
  describe, expect, it, vi,
} from 'vitest';

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock('@openimis/fe-core', async () => vi.importActual('@openimis/fe-core/helpers/api'));

const { default: reducer, ACTION_TYPE, MUTATION_SERVICE } = await import('./reducer');
const {
  CLEAR, ERROR, REQUEST, SUCCESS,
} = await import('./utils/action-type');
const {
  globalId, graphqlErrors, relayPage, serverError,
} = await import('@openimis/fe-core/testing');

const initial = () => reducer(undefined, { type: '@@INIT' });
const dispatch = (state, type, { payload, meta } = {}) => reducer(state, { type, payload, meta });
const respond = (state, actionType, data, meta) => dispatch(state, SUCCESS(actionType), { payload: { data }, meta });
const fail = (state, actionType, payload = serverError(500, 'Internal Server Error', 'boom')) => dispatch(
  state,
  ERROR(actionType),
  { payload },
);
const capitalise = (field) => `${field.charAt(0).toUpperCase()}${field.slice(1)}`;

const SERVER_ERROR = { code: 500, message: 'Internal Server Error', detail: 'boom' };

describe('tasks management reducer', () => {
  describe('initialisation', () => {
    it('starts with nothing loaded and nothing in flight', () => {
      const state = initial();

      expect(state.submittingMutation).toBe(false);
      expect(state.task).toBeNull();
      expect(state.taskGroup).toEqual({});
      expect(state.taskFlow).toEqual({});
      expect(state.tasks).toEqual([]);
      expect(state.taskDecisions).toEqual([]);
      expect(state.taskDecisionsTaskId).toBeNull();
    });

    it('returns the same state object for an unrelated action', () => {
      const state = initial();

      expect(reducer(state, { type: 'SOMETHING_ELSE' })).toBe(state);
    });
  });

  describe('searches', () => {
    const SEARCHES = [
      ['task groups', ACTION_TYPE.SEARCH_TASK_GROUPS, 'taskGroup', 'taskGroups'],
      ['tasks', ACTION_TYPE.SEARCH_TASKS, 'task', 'tasks'],
      ['task history', ACTION_TYPE.SEARCH_TASK_HISTORY, 'taskHistory', 'taskHistory'],
      ['task flows', ACTION_TYPE.SEARCH_TASK_FLOWS, 'taskFlow', 'taskFlows'],
      ['task decisions', ACTION_TYPE.SEARCH_TASK_DECISIONS, 'taskDecision', 'taskDecisions'],
    ];

    it.each(SEARCHES)('marks the %s search in flight when it starts', (_label, actionType, _entity, field) => {
      const state = dispatch({ ...initial(), [`fetched${capitalise(field)}`]: true }, REQUEST(actionType));

      expect(state[`fetching${capitalise(field)}`]).toBe(true);
    });

    it.each(SEARCHES)('stores the %s page with its count and page info', (_label, actionType, entity, field) => {
      const state = respond(dispatch(initial(), REQUEST(actionType)), actionType, {
        [entity]: relayPage(
          [{ id: globalId('Type', 'row-1'), code: 'A' }],
          { totalCount: 7, pageInfo: { hasNextPage: true } },
        ),
      });

      expect(state[field]).toHaveLength(1);
      expect(state[field][0]).toMatchObject({ code: 'A' });
      expect(state[`${field}TotalCount`]).toBe(7);
      expect(state[`${field}PageInfo`]).toMatchObject({ totalCount: 7, hasNextPage: true });
      expect(state[`fetching${capitalise(field)}`]).toBe(false);
      expect(state[`fetched${capitalise(field)}`]).toBe(true);
      expect(state[`error${capitalise(field)}`]).toBeNull();
    });

    it.each(SEARCHES)('reports an empty %s page rather than throwing', (_label, actionType, entity, field) => {
      const state = respond(initial(), actionType, { [entity]: null });

      expect(state[field]).toEqual([]);
      expect(state[`${field}PageInfo`]).toEqual({});
    });

    it.each(SEARCHES)('surfaces a data error from the %s search', (_label, actionType, entity, field) => {
      const state = dispatch(initial(), SUCCESS(actionType), {
        payload: { data: { [entity]: relayPage([]) }, ...graphqlErrors('bad filter', 'worse filter') },
      });

      expect(state[`error${capitalise(field)}`]).toEqual({
        code: 'Data error',
        message: 'Server returned data error status',
        detail: 'bad filter; worse filter',
      });
    });

    it.each(SEARCHES)('formats a transport failure of the %s search', (_label, actionType, _entity, field) => {
      const state = fail(dispatch(initial(), REQUEST(actionType)), actionType);

      expect(state[`error${capitalise(field)}`]).toEqual(SERVER_ERROR);
      expect(state[`fetching${capitalise(field)}`]).toBe(false);
    });

    it.each([
      ['tasks', ACTION_TYPE.SEARCH_TASKS, 'tasks'],
      ['task history', ACTION_TYPE.SEARCH_TASK_HISTORY, 'taskHistory'],
      ['task flows', ACTION_TYPE.SEARCH_TASK_FLOWS, 'taskFlows'],
      ['task decisions', ACTION_TYPE.SEARCH_TASK_DECISIONS, 'taskDecisions'],
    ])('drops the previous %s and their error when a new search starts', (_label, actionType, field) => {
      const stale = { ...initial(), [field]: [{ id: 'stale' }], [`error${capitalise(field)}`]: SERVER_ERROR };
      const state = dispatch(stale, REQUEST(actionType));

      expect(state[field]).toEqual([]);
      expect(state[`error${capitalise(field)}`]).toBeNull();
      expect(state[`fetched${capitalise(field)}`]).toBe(false);
    });

    it.each([
      ['tasks', ACTION_TYPE.SEARCH_TASKS, 'task', 'tasks'],
      ['task history', ACTION_TYPE.SEARCH_TASK_HISTORY, 'taskHistory', 'taskHistory'],
    ])('decodes the global ids of %s rows', (_label, actionType, entity, field) => {
      const state = respond(initial(), actionType, {
        [entity]: relayPage([{ id: globalId('TaskGQLType', 'task-1') }, { id: globalId('TaskGQLType', 'task-2') }]),
      });

      expect(state[field].map((row) => row.id)).toEqual(['task-1', 'task-2']);
    });

    it.each([
      ['task groups', ACTION_TYPE.SEARCH_TASK_GROUPS, 'taskGroup', 'taskGroups'],
      ['task flows', ACTION_TYPE.SEARCH_TASK_FLOWS, 'taskFlow', 'taskFlows'],
      ['task decisions', ACTION_TYPE.SEARCH_TASK_DECISIONS, 'taskDecision', 'taskDecisions'],
    ])('keeps the global ids of %s rows, which their pages link by', (_label, actionType, entity, field) => {
      const encoded = globalId('TaskGroupGQLType', 'group-1');
      const state = respond(initial(), actionType, { [entity]: relayPage([{ id: encoded }]) });

      expect(state[field][0].id).toBe(encoded);
    });
  });

  describe('single task', () => {
    const taskNode = (overrides = {}) => ({
      id: globalId('TaskGQLType', 'task-1'),
      status: 'ACCEPTED',
      businessData: JSON.stringify({ name: 'Plan A' }),
      ...overrides,
    });

    it('drops the previous task while the next one loads', () => {
      const loaded = { ...initial(), task: { id: 'old' }, fetchedTask: true };
      const state = dispatch(loaded, REQUEST(ACTION_TYPE.GET_TASK));

      expect(state).toMatchObject({ task: null, fetchingTask: true, fetchedTask: false });
    });

    it('decodes the id and parses the business data', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK, { task: relayPage([taskNode()]) });

      expect(state.task).toEqual({ id: 'task-1', status: 'ACCEPTED', businessData: { name: 'Plan A' } });
      expect(state).toMatchObject({ fetchingTask: false, fetchedTask: true, errorTask: null });
    });

    it('keeps a beneficiary data schema as a string so it can be shown and edited as text', () => {
      const schema = { properties: { age: { type: 'integer' } } };
      const state = respond(initial(), ACTION_TYPE.GET_TASK, {
        task: relayPage([taskNode({ businessData: JSON.stringify({ code: 'BP1', beneficiary_data_schema: schema }) })]),
      });

      expect(state.task.businessData).toEqual({ code: 'BP1', beneficiary_data_schema: JSON.stringify(schema) });
    });

    it('accepts a task with no business data', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK, { task: relayPage([taskNode({ businessData: null })]) });

      expect(state.task.businessData).toBeNull();
    });

    it('takes only the first task when the filter matches several', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK, {
        task: relayPage([taskNode(), taskNode({ id: globalId('TaskGQLType', 'task-2') })]),
      });

      expect(state.task.id).toBe('task-1');
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_TASK)).toMatchObject({ fetchingTask: false, errorTask: SERVER_ERROR });
    });

    it('forgets the task when cleared', () => {
      const loaded = respond(initial(), ACTION_TYPE.GET_TASK, { task: relayPage([taskNode()]) });

      expect(dispatch({ ...loaded, errorTask: SERVER_ERROR }, CLEAR(ACTION_TYPE.GET_TASK))).toMatchObject({
        task: null, fetchingTask: false, fetchedTask: false, errorTask: null,
      });
    });
  });

  describe('single task group', () => {
    const groupNode = (overrides = {}) => ({
      id: globalId('TaskGroupGQLType', 'group-1'),
      code: 'G1',
      completionPolicy: 'ANY',
      jsonExt: JSON.stringify({ task_sources: ['BenefitPlanService', 'payroll'] }),
      taskexecutorSet: {
        edges: [
          { node: { user: { id: 'user-1', username: 'ada' } } },
          { node: { user: { id: 'user-2', username: 'alan' } } },
        ],
      },
      ...overrides,
    });

    it('marks the group in flight when it starts loading', () => {
      expect(dispatch(initial(), REQUEST(ACTION_TYPE.GET_TASK_GROUP)).fetchingTaskGroup).toBe(true);
    });

    it('flattens the executors to their users and the sources to picker options', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK_GROUP, { taskGroup: relayPage([groupNode()]) });

      expect(state.taskGroup).toMatchObject({
        id: 'group-1',
        code: 'G1',
        taskexecutorSet: [{ id: 'user-1', username: 'ada' }, { id: 'user-2', username: 'alan' }],
        taskSources: [
          { id: 'BenefitPlanService', name: 'BenefitPlanService' },
          { id: 'payroll', name: 'payroll' },
        ],
      });
      expect(state).toMatchObject({ fetchingTaskGroup: false, fetchedTaskGroup: true, errorTaskGroup: null });
    });

    it('gives a group without extension data an empty source list', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK_GROUP, {
        taskGroup: relayPage([groupNode({ jsonExt: null, taskexecutorSet: undefined })]),
      });

      expect(state.taskGroup.taskSources).toEqual([]);
      expect(state.taskGroup.taskexecutorSet).toBeUndefined();
    });

    // Currently fails: the reducer guards a missing jsonExt but not a jsonExt without
    // task_sources, so `.task_sources.map` throws and the group page never loads.
    it.fails('gives a group whose extension data has no sources an empty source list', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK_GROUP, {
        taskGroup: relayPage([groupNode({ jsonExt: JSON.stringify({ note: 'seeded' }) })]),
      });

      expect(state.taskGroup.taskSources).toEqual([]);
    });

    it('surfaces a data error', () => {
      const state = dispatch(initial(), SUCCESS(ACTION_TYPE.GET_TASK_GROUP), {
        payload: { data: { taskGroup: null }, ...graphqlErrors('no such group') },
      });

      expect(state.errorTaskGroup).toMatchObject({ detail: 'no such group' });
      expect(state.taskGroup).toBeUndefined();
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_TASK_GROUP)).toMatchObject({
        fetchingTaskGroup: false, errorTaskGroup: SERVER_ERROR,
      });
    });

    it('forgets the group when cleared', () => {
      const loaded = respond(initial(), ACTION_TYPE.GET_TASK_GROUP, { taskGroup: relayPage([groupNode()]) });

      expect(dispatch(loaded, CLEAR(ACTION_TYPE.GET_TASK_GROUP))).toMatchObject({
        taskGroup: {}, fetchingTaskGroup: false, fetchedTaskGroup: false, errorTaskGroup: null,
      });
    });
  });

  describe('single task flow', () => {
    const step = { id: 'step-1', order: 1, taskGroup: { id: 'g', code: 'G1' } };
    const flowNode = (overrides = {}) => ({
      id: globalId('TaskFlowGQLType', 'flow-1'),
      code: 'F1',
      taskSources: ['payroll'],
      steps: [step],
      ...overrides,
    });

    it('marks the flow in flight and not yet fetched when it starts loading', () => {
      const state = dispatch({ ...initial(), fetchedTaskFlow: true }, REQUEST(ACTION_TYPE.GET_TASK_FLOW));

      expect(state).toMatchObject({ fetchingTaskFlow: true, fetchedTaskFlow: false });
    });

    it('decodes the id, turns the sources into picker options and copies the steps', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK_FLOW, { taskFlow: relayPage([flowNode()]) });

      expect(state.taskFlow).toEqual({
        id: 'flow-1',
        code: 'F1',
        taskSources: [{ id: 'payroll', name: 'payroll' }],
        steps: [step],
      });
      expect(state.taskFlow.steps[0]).not.toBe(step);
      expect(state).toMatchObject({ fetchingTaskFlow: false, fetchedTaskFlow: true, errorTaskFlow: null });
    });

    it('gives a flow without sources or steps empty lists', () => {
      const state = respond(initial(), ACTION_TYPE.GET_TASK_FLOW, {
        taskFlow: relayPage([flowNode({ taskSources: null, steps: null })]),
      });

      expect(state.taskFlow).toMatchObject({ taskSources: [], steps: [] });
    });

    it('formats a transport failure', () => {
      expect(fail(initial(), ACTION_TYPE.GET_TASK_FLOW)).toMatchObject({
        fetchingTaskFlow: false, errorTaskFlow: SERVER_ERROR,
      });
    });

    it('forgets the flow when cleared', () => {
      const loaded = respond(initial(), ACTION_TYPE.GET_TASK_FLOW, { taskFlow: relayPage([flowNode()]) });

      expect(dispatch(loaded, CLEAR(ACTION_TYPE.GET_TASK_FLOW))).toMatchObject({
        taskFlow: {}, fetchingTaskFlow: false, fetchedTaskFlow: false, errorTaskFlow: null,
      });
    });
  });

  describe('which task the decisions belong to', () => {
    const decisions = relayPage([{ id: 'd-1', decision: 'APPROVED' }]);

    it('records the task a decision search was started for', () => {
      const state = dispatch(initial(), REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS), { meta: { taskId: 'task-1' } });

      expect(state.taskDecisionsTaskId).toBe('task-1');
    });

    it('forgets the previous task when a search starts without naming one', () => {
      const owned = { ...initial(), taskDecisionsTaskId: 'task-1' };

      expect(dispatch(owned, REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS)).taskDecisionsTaskId).toBeNull();
    });

    it('labels the result with the task named in the response', () => {
      const requested = dispatch(initial(), REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS), { meta: { taskId: 'task-1' } });

      expect(respond(requested, ACTION_TYPE.SEARCH_TASK_DECISIONS, { taskDecision: decisions }, { taskId: 'task-2' })
        .taskDecisionsTaskId).toBe('task-2');
    });

    it('keeps the requested task when the response does not name one', () => {
      const requested = dispatch(initial(), REQUEST(ACTION_TYPE.SEARCH_TASK_DECISIONS), { meta: { taskId: 'task-1' } });

      expect(respond(requested, ACTION_TYPE.SEARCH_TASK_DECISIONS, { taskDecision: decisions })
        .taskDecisionsTaskId).toBe('task-1');
    });
  });

  describe('mutations', () => {
    const MUTATION_RESULTS = [
      [ACTION_TYPE.CREATE_TASK_GROUP, 'createTaskGroup'],
      [ACTION_TYPE.UPDATE_TASK_GROUP, 'updateTaskGroup'],
      [ACTION_TYPE.DELETE_TASK_GROUP, 'deleteTaskGroup'],
      [ACTION_TYPE.UPDATE_TASK, 'updateTask'],
      [ACTION_TYPE.RESOLVE_TASK, 'resolveTask'],
      [ACTION_TYPE.CREATE_TASK_FLOW, 'createTaskFlow'],
      [ACTION_TYPE.UPDATE_TASK_FLOW, 'updateTaskFlow'],
      [ACTION_TYPE.REPLACE_TASK_FLOW, 'replaceTaskFlow'],
      [ACTION_TYPE.DELETE_TASK_FLOW, 'deleteTaskFlow'],
    ];

    const submitting = () => dispatch(initial(), REQUEST(ACTION_TYPE.MUTATION), {
      meta: { clientMutationId: 'cmid-1', clientMutationLabel: 'Resolve task' },
    });

    it('covers every mutation service the module declares', () => {
      const declared = Object.values(MUTATION_SERVICE).flatMap((group) => Object.values(group));

      expect(MUTATION_RESULTS.map(([, service]) => service).sort()).toEqual(declared.sort());
    });

    it('records the request metadata while a mutation is in flight', () => {
      expect(submitting()).toMatchObject({
        submittingMutation: true,
        mutation: { id: 'cmid-1', clientMutationLabel: 'Resolve task' },
      });
    });

    it.each(MUTATION_RESULTS)('clears the in-flight flag and keeps the internal id of %s', (actionType, service) => {
      const state = respond(submitting(), actionType, { [service]: { internalId: 'internal-1' } });

      expect(state.submittingMutation).toBe(false);
      expect(state.mutation).toMatchObject({ id: 'internal-1', clientMutationLabel: 'Resolve task' });
    });

    it('raises an alert when a mutation fails', () => {
      const state = fail(submitting(), ACTION_TYPE.MUTATION, { status: 500, statusText: 'Internal Server Error' });

      expect(JSON.parse(state.alert)).toEqual({ status: 500, statusText: 'Internal Server Error' });
    });

    // Currently fails: fe-core's dispatchMutationErr only sets the alert, so the flag the
    // request raised stays up and TaskApprovementPanel never journals the failed resolution.
    it.fails('stops submitting once a mutation has failed', () => {
      const state = fail(submitting(), ACTION_TYPE.MUTATION, { status: 500, statusText: 'Internal Server Error' });

      expect(state.submittingMutation).toBe(false);
    });
  });
});
