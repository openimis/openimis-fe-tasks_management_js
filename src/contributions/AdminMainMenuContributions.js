import React from 'react';

import {
  People,
} from '@material-ui/icons';

import { FormattedMessage } from '@openimis/fe-core';
import {
  RIGHT_TASK_EXECUTIONER_GROUPS,
} from '../constants';

function getAdminMainMenuContributions() {
  return [{
    text: <FormattedMessage module="tasksManagement" id="menu.taskExecutionerGroups" />,
    icon: <People />,
    route: '/tasks/groups',
    filter: (rights) => rights.includes(RIGHT_TASK_EXECUTIONER_GROUPS),
  }];
}

export default getAdminMainMenuContributions;
