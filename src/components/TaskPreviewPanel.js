import React from 'react';
import { Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import TaskPreview from './TaskPreviewTable';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
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

function TaskPreviewPanel({ rights, formatMessage, formatMessageWithValues }) {
  const classes = useStyles();

  return (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {formatMessage('benefitPlanTask.detailsPage.triage.preview')}
      </Typography>
      <div className={classes.page}>
        <TaskPreview
          rights={rights}
          formatMessageWithValues={formatMessageWithValues}
          formatMessage={formatMessage}
          previewItems={DUMMY_PREVIEW_ITEMS}
        />
      </div>
    </Paper>
  );
}

export default TaskPreviewPanel;
