import messages_en from "./translations/en.json";
import reducer from "./reducer";
import TasksMainMenu from "./menus/TasksMainMenu";

const ROUTE_TASKS_MANAGEMENT = "tasks";

const DEFAULT_CONFIG = {
  "translations": [{ key: "en", messages: messages_en }],
  "reducers": [{ key: "tasksManagement", reducer }],
  "core.MainMenu": [TasksMainMenu],
  "core.Router": [
    // { path: ROUTE_TASKS_MANAGEMENT, component: <></> },
  ],
  refs: [],
}

export const TasksManagementModule = (cfg) => {
  return { ...DEFAULT_CONFIG, ...cfg };
}