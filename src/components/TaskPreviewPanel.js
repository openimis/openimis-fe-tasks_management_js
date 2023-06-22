import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  title: theme.paper.title,
}));

function TaskPreviewPanel({ formatMessage }) {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {formatMessage('benefitPlanTask.detailsPage.triage.preview')}
      </Typography>
      <div className={classes.page}>
        {/* <BenefitPlanTasksSearcher rights={rights} /> */}
      </div>
    </Paper>
  );
}

export default TaskPreviewPanel;
