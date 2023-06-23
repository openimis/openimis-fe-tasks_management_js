import React from 'react';
import { Grid, Divider, Typography } from '@material-ui/core';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  FormattedMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import StatusPicker from '../../pickers/StatusPicker';
import { POLICY_STATUS_LIST } from '../../constants';
import TaskExecutorsPicker from '../../pickers/TaskExecutorsPicker';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

const renderHeadPanelTitle = (classes) => (
  <Grid container className={classes.tableTitle}>
    <Grid item>
      <Grid
        container
        align="center"
        justify="center"
        direction="column"
        className={classes.fullHeight}
      >
        <Grid item>
          <Typography>
            <FormattedMessage module="tasksManagement" id="taskGroup.detailsPage.headPanelTitle" />
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

class TaskGroupHeadPanel extends FormPanel {
  render() {
    const {
      edited, classes, formatMessage, readOnly,
    } = this.props;
    const taskGroup = { ...edited };
    return (
      <>
        {renderHeadPanelTitle(classes)}
        <Divider />
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="tasksManagement"
              label="taskGroup.code"
              readOnly={readOnly}
              value={taskGroup?.code}
              onChange={(code) => this.updateAttribute('code', code)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <StatusPicker
              label="taskGroup.completionPolicy"
              constants={POLICY_STATUS_LIST}
              withLabel
              nullLabel={formatMessage('defaultValue.any')}
              readOnly={readOnly}
              withNull
              value={taskGroup?.completionPolicy}
              onChange={(completionPolicy) => this.updateAttribute('completionPolicy', completionPolicy)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            {/* ADJUST IF BE READY */}
            <TaskExecutorsPicker
              required
              readOnly={readOnly}
              value={taskGroup?.executors}
              onChange={(executor) => this.updateAttribute([...taskGroup.executors, executor])}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(TaskGroupHeadPanel))));
