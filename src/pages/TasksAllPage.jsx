/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import { useLocation } from '@openimis/fe-core';
import TaskAllSearcher from '../components/TaskAllSearcher';

import {
  RIGHT_TASKS_MANAGEMENT_SEARCH,
} from '../constants';

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

const StyledPaper = styled('div')(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTitle = styled('div')(({ theme }) => ({
  ...theme.paper?.title ?? {},
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

function TasksAllPage() {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);
  // ?entityIds=<uuid>: the tasks of one record, as opened from its pending task count.
  const entityId = new URLSearchParams(useLocation().search).get('entityIds');
  return (
    <StyledPage>
      {/* TaskGQLType.get_queryset scopes rows: triage/admin see every task,
          a plain executor sees only their own actionable ones. */}
      {rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH) && (
        <TaskAllSearcher
          rights={rights}
          entityIds={entityId ? [entityId] : undefined}
        />
      )}
    </StyledPage>
  );
}

export default TasksAllPage;
