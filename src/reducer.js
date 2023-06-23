/* eslint-disable default-param-last */

import {
  formatServerError,
  formatGraphQLError,
  dispatchMutationReq,
  dispatchMutationErr,
  dispatchMutationResp,
  parseData,
  pageInfo,
} from '@openimis/fe-core';
import { REQUEST, SUCCESS, ERROR } from './utils/action-type';

export const ACTION_TYPE = {
  MUTATION: 'TASK_MANAGEMENT_MUTATION',
  SEARCH_TASK_GROUPS: 'TASK_MANAGEMENT_TASK_GROUPS',
  GET_TASK_GROUP: 'TASK_MANAGEMENT_TASK_GROUP',
  CREATE_TASK_GROUP: 'TASK_MANAGEMENT_CREATE_TASK_GROUP',
  UPDATE_TASK_GROUP: 'TASK_MANAGEMENT_UPDATE_TASK_GROUP',
  DELETE_TASK_GROUP: 'TASK_MANAGEMENT_DELETE_TASK_GROUP',
};

export const MUTATION_SERVICE = {
  TASK_GROUP: {
    CREATE: 'createTaskGroup',
    UPDATE: 'updateTaskGroup',
    DELETE: 'deleteTaskGroup',
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
    case ERROR(ACTION_TYPE.SEARCH_TASK_GROUPS):
      return {
        ...state,
        fetchingTaskGroups: false,
        errorTaskGroups: formatServerError(action.payload),
      };
    case REQUEST(ACTION_TYPE.GET_TASK_GROUP):
      return {
        ...state,
        fetchingTaskGroup: true,
      };
    case SUCCESS(ACTION_TYPE.GET_TASK_GROUP):
      return {
        ...state,
        taskGroup: {},
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
    case REQUEST(ACTION_TYPE.MUTATION):
      return dispatchMutationReq(state, action);
    case ERROR(ACTION_TYPE.MUTATION):
      return dispatchMutationErr(state, action);
    case SUCCESS(ACTION_TYPE.CREATE_TASK_GROUP):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK_GROUP.CREATE, action);
    case SUCCESS(ACTION_TYPE.UPDATE_TASK_GROUP):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK_GROUP.UPDATE, action);
    case SUCCESS(ACTION_TYPE.DELETE_TASK_GROUP):
      return dispatchMutationResp(state, MUTATION_SERVICE.TASK_GROUP.DELETE, action);
    default:
      return state;
  }
}

export default reducer;
