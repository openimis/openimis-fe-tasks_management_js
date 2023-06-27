import {
  graphql,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
  decodeId,
  graphqlWithVariables,
} from '@openimis/fe-core';
import { ACTION_TYPE, MUTATION_SERVICE } from './reducer';
import {
  REQUEST, SUCCESS, ERROR, CLEAR,
} from './utils/action-type';

const TASK_GROUP_PROJECTION = () => [
  'id',
  'uuid',
  'code',
  'completionPolicy',
  'taskexecutorSet { edges { node { user { id username lastName } } } }',
];

export const formatTaskGroupGQL = (taskGroup) => {
  const executors = taskGroup?.executors?.map((executor) => decodeId(executor.id));
  const executorsString = executors ? `[${executors.map((executorUuid) => `"${executorUuid}"`).join(', ')}]` : '[]';
  const GQLString = `
  ${taskGroup?.code ? `code: "${formatGQLString(taskGroup.code)}"` : ''}
  ${taskGroup?.completionPolicy ? `completionPolicy: ${taskGroup.completionPolicy}` : ''}
  ${taskGroup?.id ? `id: "${decodeId(taskGroup.id)}"` : ''}
  ${taskGroup?.executors ? `userIds: ${executorsString}` : 'userIds: []'}
  `;
  return GQLString;
};

export function fetchTaskGroups(modulesManager, params) {
  const payload = formatPageQueryWithCount('taskGroup', params, TASK_GROUP_PROJECTION());
  return graphql(payload, ACTION_TYPE.SEARCH_TASK_GROUPS);
}

export function fetchTaskGroup(modulesManager, variables) {
  return graphqlWithVariables(
    `
      query getTaskGroup ($taskGroupUuid: ID ) {
        taskGroup(id: $taskGroupUuid) {
          edges {
            node {
              id
              uuid
              code
              completionPolicy
              taskexecutorSet { edges { node { user { id username lastName } } } },
            }
          }
        }
      }
      `,
    variables,
    ACTION_TYPE.GET_TASK_GROUP,
  );
}

export const clearTaskGroup = () => (dispatch) => {
  dispatch({
    type: CLEAR(ACTION_TYPE.GET_TASK_GROUP),
  });
};

export function deleteTaskGroup(taskGroup, clientMutationLabel) {
  const taskGroupsUuids = `ids: ["${decodeId(taskGroup?.id)}"]`;
  const mutation = formatMutation(MUTATION_SERVICE.TASK_GROUP.DELETE, taskGroupsUuids, clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.DELETE_TASK_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.DELETE_TASK_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function createTaskGroup(taskGroup, clientMutationLabel) {
  const mutation = formatMutation(
    MUTATION_SERVICE.TASK_GROUP.CREATE,
    formatTaskGroupGQL(taskGroup),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.CREATE_TASK_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.CREATE_TASK_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}

export function updateTaskGroup(taskGroup, clientMutationLabel) {
  const mutation = formatMutation(
    MUTATION_SERVICE.TASK_GROUP.UPDATE,
    formatTaskGroupGQL(taskGroup),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE.UPDATE_TASK_GROUP), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE.UPDATE_TASK_GROUP,
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}
