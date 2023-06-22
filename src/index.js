// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */

import messages_en from './translations/en.json';
import reducer from './reducer';
import TasksMainMenu from './menus/TasksMainMenu';
import TasksManagementPage from './pages/TasksManagementPage';
import TaskTriageDetailsPage from './pages/TaskTriageDetailsPage';

const ROUTE_TASKS_MANAGEMENT = 'tasks';
const ROUTE_TASK_MANAGEMENT = 'tasks/task';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'tasksManagement', reducer }],
  'core.MainMenu': [TasksMainMenu],
  'core.Router': [
    { path: ROUTE_TASKS_MANAGEMENT, component: TasksManagementPage },
    { path: `${ROUTE_TASK_MANAGEMENT}/:task_uuid?`, component: TaskTriageDetailsPage },
  ],
  refs: [
    { key: 'tasksManagement.route.task', ref: ROUTE_TASK_MANAGEMENT },
  ],
};

export const TasksManagementModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
