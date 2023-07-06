import React, { useState, useEffect } from 'react';
import { makeStyles, Paper, Typography } from '@material-ui/core';
import {
  Contributions, useTranslations,
  useModulesManager,
} from '@openimis/fe-core';
import {
  BENEFIT_PLAN_TASK_PREVIEW_TABLE_VALUE,
  BENEFIT_PLAN_UPDATE_STRING, EMPTY_STRING,
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
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);
  const [taskTable, setTaskTable] = useState(EMPTY_STRING);
  const task = { ...edited };

  useEffect(() => {
    switch (task?.source) {
      case BENEFIT_PLAN_UPDATE_STRING:
        setTaskTable(BENEFIT_PLAN_TASK_PREVIEW_TABLE_VALUE);
        break;
      default:
        setTaskTable(EMPTY_STRING);
    }
  }, [task]);

  return taskTable && (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {formatMessage('benefitPlanTask.detailsPage.triage.preview')}
      </Typography>
      <Contributions
        contributionKey={TASKS_PREVIEW_CONTRIBUTION_KEY}
        rights={rights}
        value={taskTable}
        formatMessage={formatMessage}
        previewItem={task}
      />
    </Paper>
  );
}

export default TaskPreviewPanel;
