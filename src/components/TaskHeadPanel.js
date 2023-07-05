import React from 'react';
import { Grid, Divider, Typography } from '@material-ui/core';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  FormattedMessage,
  formatMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import TaskStatusPicker from '../pickers/TaskStatusPicker';
import TaskGroupPicker from '../pickers/TaskGroupPicker';

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
            <FormattedMessage module="tasksManagement" id="benefitPlanTask.detailsPage.triage.headPanelTitle" />
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

class TaskHeadPanel extends FormPanel {
  render() {
    const {
      intl, edited, classes, readOnly,
    } = this.props;
    const task = { ...edited };
    return (
      <>
        {renderHeadPanelTitle(classes)}
        <Divider />
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="tasksManagement"
              label="benefitPlanTask.source"
              readOnly={readOnly}
              value={task?.source}
              onChange={(source) => this.updateAttribute('source', source)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="tasksManagement"
              label="benefitPlanTask.type"
              readOnly={readOnly}
              value={task?.type}
              onChange={(type) => this.updateAttribute('type', type)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="tasksManagement"
              label="benefitPlanTask.entity"
              readOnly={readOnly}
              value={task?.entity}
              onChange={(entity) => this.updateAttribute('entity', entity)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TaskGroupPicker
              module="tasksManagement"
              mandatory
              withLabel
              readOnly={false}
              withNull
              value={task?.taskGroup}
              onChange={(taskGroup) => this.updateAttribute('taskGroup', taskGroup)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="tasksManagement"
              label="benefitPlanTask.businessStatus"
              readOnly={readOnly}
              value={task?.businessStatus}
              onChange={(businessStatus) => this.updateAttribute('businessStatus', businessStatus)}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TaskStatusPicker
              label="benefitPlanTask.status"
              withLabel
              nullLabel={formatMessage(intl, 'tasksManagement', 'defaultValue.any')}
              readOnly={readOnly}
              withNull
              value={task?.status}
              onChange={(status) => this.updateAttribute('status', status)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(TaskHeadPanel))));
