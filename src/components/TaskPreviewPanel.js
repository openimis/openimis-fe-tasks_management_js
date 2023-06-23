import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import TaskPreview from './TaskPreviewTable';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  title: theme.paper.title,
}));

const DUMMY_PREVIEW_ITEMS = [

  {
    id: 1,
    source: 'Phone',
    type: 'Support',
    entity: 'Customer A',
    assignee: 'John Doe',
    businessStatus: 'Pending',
    status: 'RECEIVED',
    historic: {
      id: 1,
      source: 'Email',
      type: 'Support',
      entity: 'Customer A',
      assignee: 'John Doe',
      businessStatus: 'Pending',
      status: 'RECEIVED',
    },
  },
  {
    id: 2,
    source: 'Phone',
    type: 'Sales',
    entity: 'Customer B',
    assignee: 'Jane Smith',
    businessStatus: 'Completed',
    status: 'CLOSED',
    historic: {
      id: 2,
      source: 'Phone',
      type: 'Sales',
      entity: 'Customer B',
      assignee: 'Jane Smith',
      businessStatus: 'In Progress',
      status: 'ONGOING',
    },
  },
];

function TaskPreviewPanel({ rights, formatMessage }) {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {formatMessage('benefitPlanTask.detailsPage.triage.preview')}
      </Typography>
      <TaskPreview
        rights={rights}
        formatMessage={formatMessage}
        previewItems={DUMMY_PREVIEW_ITEMS}
      />
    </Paper>
  );
}

export default TaskPreviewPanel;
