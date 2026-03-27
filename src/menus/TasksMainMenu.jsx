// Disable due to core architecture
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { formatMessage, MainMenuContribution, withModulesManager } from '@openimis/fe-core';
import {
  RIGHT_TASKS_MANAGEMENT_SEARCH_ALL,
  TASKS_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY,
} from '../constants';

function TasksMainMenu(props) {
  return (
    <MainMenuContribution
      {...props}
      header={formatMessage(props.intl, 'tasksManagement', 'tasksMainMenu')}
      menuId="TasksMainMenu"
      contributionKey={TASKS_MANAGEMENT_MAIN_MENU_CONTRIBUTION_KEY}
      icon={<AssignmentIcon />}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
});

export { TasksMainMenu };
export default withModulesManager(injectIntl(connect(mapStateToProps)(TasksMainMenu)));
