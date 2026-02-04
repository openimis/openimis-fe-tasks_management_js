import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  FormattedMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import TaskExecutorsPicker from '../../pickers/TaskExecutorsPicker';
import GroupPolicyPicker from '../../pickers/GroupPolicyPicker';
import TaskSourcePicker from '../../pickers/TaskSourcePicker';

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

const StyledFullHeight = styled('div')(({ theme }) => ({
  height: '100%',
}));

const renderHeadPanelTitle = () => (
  <Grid container component={StyledTableTitle}>
    <Grid>
      <Grid
        container
        align="center"
        justify="center"
        direction="column"
        component={StyledFullHeight}
      >
        <Grid>
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
      edited, readOnly,
    } = this.props;
    const taskGroup = { ...edited };
    return (
      <>
        {renderHeadPanelTitle()}
        <Divider />
        <Grid container component={StyledItem}>
          <Grid size={3} component={StyledItem}>
            <TextInput
              module="tasksManagement"
              label="taskGroup.code"
              readOnly={readOnly}
              value={taskGroup?.code}
              onChange={(code) => this.updateAttribute('code', code)}
              required
            />
          </Grid>
          <Grid size={3} component={StyledItem}>
            <GroupPolicyPicker
              label="taskGroup.completionPolicy"
              withLabel
              readOnly={readOnly}
              withNull={false}
              value={taskGroup?.completionPolicy}
              onChange={(completionPolicy) => this.updateAttribute('completionPolicy', completionPolicy)}
              required
            />
          </Grid>
          <Grid size={6} component={StyledItem}>
            <TaskExecutorsPicker
              required
              readOnly={readOnly}
              groupId={taskGroup?.uuid}
              value={taskGroup?.taskexecutorSet}
              onChange={(executors) => this.updateAttribute('taskexecutorSet', executors)}
            />
          </Grid>
          <Grid size={6} component={StyledItem}>
            <TaskSourcePicker
              readOnly={readOnly}
              value={taskGroup?.taskSources}
              onChange={(sources) => this.updateAttribute('taskSources', sources)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export { StyledTableTitle };
export default withModulesManager(injectIntl(TaskGroupHeadPanel));
