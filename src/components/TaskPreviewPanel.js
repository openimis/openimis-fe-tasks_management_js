import React, { useState, useEffect } from 'react';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import { useModulesManager } from '@openimis/fe-core';
import { EMPTY_STRING, TASK_CONTRIBUTION_KEY } from '../constants';
import TaskPreviewTable from './TaskPreviewTable';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  title: theme.paper.title,
}));

function TaskPreviewPanel({ rights, edited }) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const [header, setHeader] = useState(EMPTY_STRING);
  const [tableTaskHeaders, setTableTaskHeaders] = useState([]);
  const [taskItemFormatters, setTaskItemFormatters] = useState([]);
  const task = { ...edited };

  useEffect(() => {
    if (task.source) {
      const contrib = modulesManager.getContribs(TASK_CONTRIBUTION_KEY)
        .find((c) => c.taskSource.includes(task.source));

      if (contrib) {
        const { tableHeaders, itemFormatters, text } = contrib;
        setHeader(text);
        setTableTaskHeaders(tableHeaders);
        setTaskItemFormatters(itemFormatters);
      }
    }
  }, [task.source]);

  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {header}
      </Typography>
      <TaskPreviewTable
        rights={rights}
        previewItem={task}
        tableHeaders={tableTaskHeaders}
        itemFormatters={taskItemFormatters}
      />
    </Paper>
  );
}

export default TaskPreviewPanel;
