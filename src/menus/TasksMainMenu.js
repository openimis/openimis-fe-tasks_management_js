// Disable due to core architecture
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import { TASKS_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY } from '../constants';

function TasksMainMenu(props) {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);
  const entries = [
    {
      text: formatMessage(props.intl, 'tasksManagement', 'entries.tasksManagementView'),
      icon: <AssignmentIcon />,
      route: '/tasks',
    },
  ];
  entries.push(
    ...props.modulesManager
      .getContribs(TASKS_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY)
      .filter((c) => !c.filter || c.filter(rights)),
  );

  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, 'tasksManagement', 'tasksMainMenu')}
      entries={entries}
    />
  );
}

export default withModulesManager(injectIntl(TasksMainMenu));
