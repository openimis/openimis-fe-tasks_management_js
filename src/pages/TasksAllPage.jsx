/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '@mui/material/styles';
import TaskAllSearcher from '../components/TaskAllSearcher';

import {
  RIGHT_TASKS_MANAGEMENT_SEARCH,
  RIGHT_TASKS_MANAGEMENT_SEARCH_ALL,
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
  return (
    <StyledPage>
      {/* SEARCH scopes to the user's own actionable tasks via TaskGQLType.get_queryset;
          SEARCH_ALL sees every task (triage/admin). Either right may open this page. */}
      {(rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH)
        || rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH_ALL)) && (
        <TaskAllSearcher
          rights={rights}
        />
      )}
    </StyledPage>
  );
}

export default TasksAllPage;
