import React from 'react';
import {
  Helmet, withTooltip, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import { Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import {
  TASK_GROUP_CREATE,
  TASK_GROUP_SEARCH,
  TASKS_MANAGEMENT_ROUTE_GROUPS_GROUP,
} from '../constants';
import TaskGroupsSearcher from '../components/groups-management/TaskGroupsSearcher';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function GroupsManagementPage() {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);

  const onTaskGroupAdd = () => history.push(`/${modulesManager.getRef(TASKS_MANAGEMENT_ROUTE_GROUPS_GROUP)}`);

  return (
    rights.includes(TASK_GROUP_SEARCH) && (
    <div className={classes.page}>
      <Helmet title={formatMessage('groupsManagement.groupHelmet')} />
      <TaskGroupsSearcher rights={rights} />
      {rights.includes(TASK_GROUP_CREATE)
        && withTooltip(
          <div className={classes.fab}>
            <Fab color="primary" onClick={onTaskGroupAdd}>
              <AddIcon />
            </Fab>
          </div>,
          formatMessage('createButton.tooltip'),
        )}
    </div>
    )
  );
}

export default GroupsManagementPage;
