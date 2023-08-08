import React, { useState, useEffect } from 'react';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import {
  PublishedComponent,
  useModulesManager,
} from '@openimis/fe-core';
import {
  EMPTY_STRING,
  TASKS_PREVIEW_CONTRIBUTION_KEY,
} from '../constants';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  title: theme.paper.title,
}));

function TaskPreviewPanel({
  rights,
  edited,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const [taskTableRef, setTaskTableRef] = useState(EMPTY_STRING);
  const [header, setHeader] = useState(EMPTY_STRING);
  const task = { ...edited };

  useEffect(() => {
    if (task) {
      const contrib = modulesManager
        .getContribs(TASKS_PREVIEW_CONTRIBUTION_KEY)
        .filter((c) => c.taskSource === task?.source)[0];
      const ref = contrib?.pubRef;
      const text = contrib?.text;
      setTaskTableRef(ref || EMPTY_STRING);
      setHeader(text);
    }
  }, [task]);

  return taskTableRef && (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {header}
      </Typography>
      <PublishedComponent
        pubRef={taskTableRef}
        rights={rights}
        previewItem={task}
      />
    </Paper>
  );
}

export default TaskPreviewPanel;
