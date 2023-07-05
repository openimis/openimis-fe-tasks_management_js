import React, { useState, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import {
  Contributions,
  withHistory,
  withModulesManager,
} from '@openimis/fe-core';
import { BENEFIT_PLAN_TASK_PREVIEW_TABLE_VALUE, TASKS_PREVIEW_CONTRIBUTION_KEY } from '../constants';

const styles = (theme) => ({
  paper: theme.paper.paper,
  title: theme.paper.title,
});

function TaskPreviewPanel({
  intl,
  classes,
  rights,
  formatMessage,
  edited,
}) {
  const [taskTable, setTaskTable] = useState('');
  const task = { ...edited };

  useEffect(() => {
    switch (task?.source) {
      case 'Benefit Plan':
        setTaskTable(BENEFIT_PLAN_TASK_PREVIEW_TABLE_VALUE);
        break;
      default:
        setTaskTable('');
    }
  }, [task]);

  return taskTable && (
    <Paper className={classes.paper}>
      <Typography className={classes.title}>
        {formatMessage(intl, 'tasksManagement', 'benefitPlanTask.detailsPage.triage.preview')}
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

export default withHistory(
  withModulesManager(injectIntl(withTheme(withStyles(styles)(
    TaskPreviewPanel,
  )))),
);
