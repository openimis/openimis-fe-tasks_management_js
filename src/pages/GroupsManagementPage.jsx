import React from 'react';
import {
  Helmet, withTooltip, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  TASK_GROUP_CREATE,
  TASK_GROUP_SEARCH,
  TASKS_MANAGEMENT_ROUTE_GROUPS_GROUP,
} from '../constants';
import TaskGroupsSearcher from '../components/groups-management/TaskGroupsSearcher';

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

const StyledFab = styled('div')(({ theme }) => ({
  ...theme.fab ?? {},
}));

function GroupsManagementPage() {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);

  const onTaskGroupAdd = () => history.push(`/${modulesManager.getRef(TASKS_MANAGEMENT_ROUTE_GROUPS_GROUP)}`);

  return (
    rights.includes(TASK_GROUP_SEARCH) && (
      <StyledPage>
        <Helmet title={formatMessage('groupsManagement.groupHelmet')} />
        <TaskGroupsSearcher rights={rights} />
        {rights.includes(TASK_GROUP_CREATE)
          && withTooltip(
            <StyledFab>
              <Fab color="primary" onClick={onTaskGroupAdd}>
                <AddIcon />
              </Fab>
            </StyledFab>,
            formatMessage('createButton.tooltip'),
          )}
      </StyledPage>
    )
  );
}

export default GroupsManagementPage;
