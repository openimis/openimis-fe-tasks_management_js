/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import TaskAllSearcher from '../components/TaskAllSearcher';

import {
  RIGHT_TASKS_MANAGEMENT_SEARCH_ALL,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  title: {
    ...theme.paper.title,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

function TasksAllPage() {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);
  const classes = useStyles();
  return (
    <div className={classes.page}>
      {rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH_ALL) && (
        <TaskAllSearcher
          rights={rights}
          classes={classes}
        />
      )}
    </div>
  );
}

export default TasksAllPage;
