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

const PERFORM_MUTATION = (mutationType, mutationInput, ACTION, clientMutationLabel) => {
  const mutation = formatMutation(mutationType, mutationInput, ACTION);
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    [REQUEST(ACTION_TYPE.MUTATION), SUCCESS(ACTION_TYPE[ACTION]), ERROR(ACTION_TYPE.MUTATION)],
    {
      actionType: ACTION_TYPE[ACTION],
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
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
  return PERFORM_MUTATION(
    MUTATION_SERVICE.TASK_GROUP.DELETE,
    taskGroupsUuids,
    'DELETE_TASK_GROUP',
    clientMutationLabel,
  );
}

export function createTaskGroup(taskGroup, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.TASK_GROUP.CREATE,
    formatTaskGroupGQL(taskGroup),
    'CREATE_TASK_GROUP',
    clientMutationLabel,
  );
}

export function updateTaskGroup(taskGroup, clientMutationLabel) {
  return PERFORM_MUTATION(
    MUTATION_SERVICE.TASK_GROUP.UPDATE,
    formatTaskGroupGQL(taskGroup),
    'UPDATE_TASK_GROUP',
    clientMutationLabel,
  );
}
