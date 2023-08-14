// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */

import messages_en from './translations/en.json';
import reducer from './reducer';
import TasksMainMenu from './menus/TasksMainMenu';
import TasksManagementPage from './pages/TasksManagementPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import GroupsManagementPage from './pages/GroupsManagementPage';
import TaskGroupPage from './pages/TaskGroupPage';
import TaskStatusPicker from './pickers/TaskStatusPicker';
import TaskPreviewCell from './components/TaskPreviewCell';
import TaskGroupPicker from './pickers/TaskGroupPicker';
import getAdminMainMenuContributions from './contributions/AdminMainMenuContributions';
import { TASK_ROUTE } from "./constants";

const ROUTE_TASKS_MANAGEMENT = 'tasks';
const ROUTE_TASK_MANAGEMENT = 'tasks/task';

const ROUTE_GROUPS_MANAGEMENT = 'tasks/groups';
const ROUTE_GROUP_MANAGEMENT = 'tasks/groups/group';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'tasksManagement', reducer }],
  'core.MainMenu': [TasksMainMenu],
  'admin.MainMenu': [...getAdminMainMenuContributions()],
  'core.Router': [
    { path: ROUTE_TASKS_MANAGEMENT, component: TasksManagementPage },
    { path: `${ROUTE_TASK_MANAGEMENT}/:task_uuid?`, component: TaskDetailsPage },
    { path: ROUTE_GROUPS_MANAGEMENT, component: GroupsManagementPage },
    { path: `${ROUTE_GROUP_MANAGEMENT}/:task_group_uuid?`, component: TaskGroupPage },
  ],
  refs: [
    { key: TASK_ROUTE, ref: ROUTE_TASK_MANAGEMENT },
    { key: 'tasksManagement.route.group', ref: ROUTE_GROUP_MANAGEMENT },
    { key: 'tasksManagement.taskStatusPicker', ref: TaskStatusPicker },
    { key: 'tasksManagement.taskPreviewCell', ref: TaskPreviewCell },
    { key: 'tasksManagement.taskGroupPicker', ref: TaskGroupPicker },
  ],
};

export const TasksManagementModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
