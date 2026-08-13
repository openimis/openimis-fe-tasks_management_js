import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  NumberInput,
  FormattedMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import TaskSourcePicker from '../../pickers/TaskSourcePicker';

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

const StyledFullHeight = styled('div')(() => ({
  height: '100%',
}));

const StyledWarning = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  padding: theme.spacing(1),
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
            <FormattedMessage module="tasksManagement" id="taskFlow.detailsPage.headPanelTitle" />
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

class TaskFlowHeadPanel extends FormPanel {
  render() {
    const {
      edited, readOnly,
    } = this.props;
    const flow = { ...edited };
    const superseded = !!flow?.replacementUuid;
    return (
      <>
        {renderHeadPanelTitle()}
        <Divider />
        {superseded && (
          <StyledWarning>
            <FormattedMessage module="tasksManagement" id="taskFlow.superseded.warning" />
          </StyledWarning>
        )}
        <Grid container component={StyledItem}>
          <Grid size={3} component={StyledItem}>
            <TextInput
              module="tasksManagement"
              label="taskFlow.code"
              readOnly={readOnly}
              value={flow?.code}
              onChange={(code) => this.updateAttribute('code', code)}
              required
            />
          </Grid>
          <Grid size={3} component={StyledItem}>
            <TextInput
              module="tasksManagement"
              label="taskFlow.name"
              readOnly={readOnly}
              value={flow?.name}
              onChange={(name) => this.updateAttribute('name', name)}
            />
          </Grid>
          {!!flow?.uuid && (
            <>
              <Grid size={2} component={StyledItem}>
                <NumberInput
                  module="tasksManagement"
                  label="taskFlow.version"
                  readOnly
                  value={flow?.version}
                />
              </Grid>
              <Grid size={2} component={StyledItem}>
                <NumberInput
                  module="tasksManagement"
                  label="taskFlow.inFlightCount"
                  readOnly
                  value={flow?.inFlightCount ?? 0}
                />
              </Grid>
            </>
          )}
          <Grid size={6} component={StyledItem}>
            <TaskSourcePicker
              readOnly={readOnly}
              value={flow?.taskSources}
              onChange={(sources) => this.updateAttribute('taskSources', sources)}
            />
          </Grid>
        </Grid>
      </>
    );
  }
}

export default withModulesManager(injectIntl(TaskFlowHeadPanel));
