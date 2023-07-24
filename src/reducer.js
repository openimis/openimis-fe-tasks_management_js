/* eslint-disable default-param-last */

import {
  dispatchMutationErr,
  dispatchMutationReq,
  dispatchMutationResp,
  formatGraphQLError,
  formatServerError,
  pageInfo,
  parseData,
  decodeId,
} from '@openimis/fe-core';
import {
  CLEAR, ERROR, REQUEST, SUCCESS,
} from './utils/action-type';

export const ACTION_TYPE = {
  MUTATION: 'TASK_MANAGEMENT_MUTATION',
  SEARCH_TASK_GROUPS: 'TASK_MANAGEMENT_TASK_GROUPS',
  GET_TASK_GROUP: 'TASK_MANAGEMENT_TASK_GROUP',
  CREATE_TASK_GROUP: 'TASK_MANAGEMENT_CREATE_TASK_GROUP',
  UPDATE_TASK_GROUP: 'TASK_MANAGEMENT_UPDATE_TASK_GROUP',
  DELETE_TASK_GROUP: 'TASK_MANAGEMENT_DELETE_TASK_GROUP',
  GET_TASK: 'TASK_MANAGEMENT_TASK',
  UPDATE_TASK: 'TASK_MANAGEMENT_UPDATE_TASK',
  RESOLVE_TASK: 'TASK_MANAGEMENT_RESOLVE_TASK',
};

export const MUTATION_SERVICE = {
  TASK_GROUP: {
    CREATE: 'createTaskGroup',
    UPDATE: 'updateTaskGroup',
    DELETE: 'deleteTaskGroup',
  },
  TASK: {
    UPDATE: 'updateTask',
    RESOLVE: 'resolveTask',
  },
};

const STORE_STATE = {
  submittingMutation: false,
  mutation: {},
  taskGroups: [],
  fetchingTaskGroups: false,
  errorTaskGroups: null,
  fetchedTaskGroups: false,
  taskGroupsPageInfo: {},
  taskGroupsTotalCount: 0,
  taskGroup: {},
  fetchingTaskGroup: false,
  errorTaskGroup: null,
  fetchedTaskGroup: false,
  fetchingTask: false,
  fetchedTask: false,
  task: null,
  errorTask: null,
};

function reducer(
  state = STORE_STATE,
  action,
) {
  switch (action.type) {
    case REQUEST(ACTION_TYPE.SEARCH_TASK_GROUPS):
      return {
        ...state,
        fetchingTaskGroups: true,
      };
    case REQUEST(ACTION_TYPE.GET_TASK):
      return {
        ...state,
        fetchingTask: true,
        fetchedTask: false,
        task: null,
      };
    case SUCCESS(ACTION_TYPE.SEARCH_TASK_GROUPS):
      return {
        ...state,
        taskGroups: parseData(action.payload.data.taskGroup),
        fetchingTaskGroups: false,
        errorTaskGroups: formatGraphQLError(action.payload),
        fetchedTaskGroups: true,
        taskGroupsPageInfo: pageInfo(action.payload.data.taskGroup),
        taskGroupsTotalCount: action.payload.data.taskGroup?.totalCount ?? 0,
      };
    case SUCCESS(ACTION_TYPE.GET_TASK):
      return {
        ...state,
        fetchingTask: false,
        fetchedTask: true,
        task: parseData(action.payload.data.task)?.map((task) => ({
          ...task,
          id: decodeId(task.id),
          currentEntityData: JSON.parse((JSON.parse(task.currentEntityData))),
          data: JSON.parse(task.data, (key, value) => {
            if (['date_valid_to', 'date_valid_from'].includes(key)) {
              return `${value} 00:00:00`;
            }
            return value;
          }),
        }))?.[0],
        errorTask: null,
      };
    case ERROR(ACTION_TYPE.SEARCH_TASK_GROUPS):
      return {
        ...state,
        fetchingTaskGroups: false,
        errorTaskGroups: formatServerError(action.payload),
      };
    case ERROR(ACTION_TYPE.GET_TASK):
      return {
        ...state,
        fetchingTask: false,
        errorTask: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_TASK_GROUP):
      return {
        ...state,
        fetchingTaskGroup: true,
      };
    case SUCCESS(ACTION_TYPE.GET_TASK_GROUP):
      return {
        ...state,
        taskGroup: parseData(action.payload.data.taskGroup)?.map((taskGroup) => ({
          ...taskGroup,
          id: decodeId(taskGroup.id),
          taskexecutorSet: taskGroup?.taskexecutorSet?.edges?.map((executor) => executor.node.user),
        }))?.[0],
        fetchingTaskGroup: false,
        errorTaskGroup: formatGraphQLError(action.payload),
        fetchedTaskGroup: true,
      };
    case ERROR(ACTION_TYPE.GET_TASK_GROUP):
      return {
        ...state,
        fetchingTaskGroup: false,
        errorTaskGroup: formatServerError(action.payload),
      };
    case CLEAR(ACTION_TYPE.GET_TASK_GROUP):
      return {
        ...state,
        taskGroup: {},
        fetchingTaskGroup: false,
        errorTaskGroup: null,
        fetchedTaskGroup: false,
      };
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_TASK_GROUP):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK_GROUP.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_TASK_GROUP):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK_GROUP.UPDATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_TASK):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK.UPDATE, action);
    case SUCCESS(ACTION_TYPE.RESOLVE_TASK):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK.RESOLVE, action);
    case SUCCESS(ACTION_TYPE.DELETE_TASK_GROUP):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK_GROUP.DELETE, action);
    default:
      return state;
  }
}

export default reducer;
