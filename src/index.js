// Disable due to core architecture
/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */

import messages_en from './translations/en.json';
import reducer from './reducer';
import TasksMainMenu from './menus/TasksMainMenu';
import TasksManagementPage from './pages/TasksManagementPage';

const ROUTE_TASKS_MANAGEMENT = 'tasks';

const DEFAULT_CONFIG = {
  translations: [{ key: 'en', messages: messages_en }],
  reducers: [{ key: 'tasksManagement', reducer }],
  'core.MainMenu': [TasksMainMenu],
  'core.Router': [
    { path: ROUTE_TASKS_MANAGEMENT, component: TasksManagementPage },
  ],
  refs: [],
};

export const TasksManagementModule = (cfg) => ({ ...DEFAULT_CONFIG, ...cfg });
