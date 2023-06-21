/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/* Rules disabled due to core architecture */

import React from 'react';
import { useSelector } from 'react-redux';
// import { injectIntl } from 'react-intl';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import { TASKS_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY } from '../constants';

function TasksMainMenu(props) {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);
  const entries = [
    {
      text: 'TasksWithoutTranslation',
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
      header="TasksWithoutTranslation"
      entries={entries}
    />
  );
}

export default withModulesManager(TasksMainMenu);
