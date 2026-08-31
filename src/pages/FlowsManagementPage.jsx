import React from 'react';
import {
  GetIconComponent, Helmet, withTooltip, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { Fab } from '@mui/material';
import {
  TASK_FLOW_CREATE,
  TASK_FLOW_SEARCH,
  TASKS_MANAGEMENT_ROUTE_FLOWS_FLOW,
} from '../constants';
import TaskFlowsSearcher from '../components/flows/TaskFlowsSearcher';

const AddIcon = GetIconComponent('Add');

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

const StyledFab = styled('div')(({ theme }) => ({
  ...theme.fab ?? {},
}));

function FlowsManagementPage() {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);

  const onTaskFlowAdd = () => history.push(`/${modulesManager.getRef(TASKS_MANAGEMENT_ROUTE_FLOWS_FLOW)}`);

  return (
    rights.includes(TASK_FLOW_SEARCH) && (
      <StyledPage>
        <Helmet title={formatMessage('flowsManagement.pageHelmet')} />
        <TaskFlowsSearcher rights={rights} />
        {rights.includes(TASK_FLOW_CREATE)
          && withTooltip(
            <StyledFab>
              <Fab color="primary" onClick={onTaskFlowAdd}>
                <AddIcon />
              </Fab>
            </StyledFab>,
            formatMessage('createButton.tooltip'),
          )}
      </StyledPage>
    )
  );
}

export default FlowsManagementPage;
