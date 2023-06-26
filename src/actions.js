import {
  graphql,
  // formatPageQuery,
  formatPageQueryWithCount,
  formatMutation,
  formatGQLString,
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
  // 'usersId',
];

export const formatTaskGroupGQL = (taskGroup) => (`
${taskGroup?.code ? `code: "${formatGQLString(taskGroup.code)}"` : ''}
${taskGroup?.completionPolicy ? `completionPolicy: ${taskGroup.completionPolicy}` : ''}
${taskGroup?.id ? `id: "${taskGroup.id}"` : ''}
${taskGroup?.uuid ? `uuid: "${taskGroup.uuid}"` : ''}
${taskGroup?.executors ? `userIds: ${taskGroup.executors.map(((executor) => executor.uuid))}` : 'userIds: []'}
`);

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
  const taskGroupsUuids = `ids: ["${taskGroup?.id}"]`;
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
