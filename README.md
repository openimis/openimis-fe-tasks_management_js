# openIMIS Frontend Tasks Management module
This repository holds the files of the openIMIS Frontend Tasks Management module.
It is dedicated to be bootstrap development of [openimis-fe_js](https://github.com/openimis/openimis-fe_js) modules, providing an empty (yet deployable) module.

Please refer to [openimis-fe_js](https://github.com/openimis/openimis-fe_js) to see how to build and and deploy (in developement or server mode).

The module is built with [rollup](https://rollupjs.org/).
In development mode, you can use `npm link` and `npm start` to continuously scan for changes and automatically update your development server.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/openimis/openimis-fe-tasks_management_js.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/openimis/openimis-fe-tasks_management_js/alerts/)

## Main Menu Contributions

**Tasks** (task.menu.tasks key), displayed if user has the right `191001`

## Other Contributions

* `core.Router`: registering `tasks`, `task`, `taskGroups`, `taskGroup`, routes in openIMIS client-side router

## Available Contribution Points

## Dispatched Redux Actions

* `SEARCH_TASK_GROUPS: 'TASK_MANAGEMENT_TASK_GROUPS_{REQ|RESP|ERR}'`
* `GET_TASK_GROUP: 'TASK_MANAGEMENT_TASK_GROUP_{REQ|RESP|ERR}_{REQ|RESP|ERR}'`
* `CREATE_TASK_GROUP: 'TASK_MANAGEMENT_CREATE_TASK_GROUP_{REQ|RESP|ERR}'`
* `UPDATE_TASK_GROUP: 'TASK_MANAGEMENT_UPDATE_TASK_GROUP_{REQ|RESP|ERR}'`
* `DELETE_TASK_GROUP: 'TASK_MANAGEMENT_DELETE_TASK_GROUP_{REQ|RESP|ERR}'`
* `GET_TASK: 'TASK_MANAGEMENT_TASK_{REQ|RESP|ERR}'`
* `UPDATE_TASK: 'TASK_MANAGEMENT_UPDATE_TASK_{REQ|RESP|ERR}'`

## Other Modules Listened Redux Actions
* `state.core.user`, to access user info (rights,...)

## Other Modules Redux State Bindings

## Configurations Options