import React from 'react';
import { Grid, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  withModulesManager,
  FormPanel,
  TextInput,
  TextAreaInput,
  FormattedMessage,
  formatMessage,
} from '@openimis/fe-core';
import { injectIntl } from 'react-intl';
import TaskStatusPicker from '../pickers/TaskStatusPicker';
import TaskGroupPicker from '../pickers/TaskGroupPicker';
import { TASK_STATUS, TASK_UPDATE } from '../constants';
import trimBusinessEvent from '../utils/trimBusinessEvent';
import TaskHistoryDialog from './dialogs/TaskHistoryDialog';

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

const StyledFullHeight = styled('div')(({ theme }) => ({
  height: '100%',
}));

const renderHeadPanelTitle = (rights, task) => (
  <Grid container component={StyledTableTitle}>
    <Grid
      container
      align="center"
      justify="space-between"
      direction="row"
      component={StyledFullHeight}
    >
      <Grid>
        <Typography>
          <FormattedMessage module="tasksManagement" id="task.detailsPage.triage.headPanelTitle" />
        </Typography>
      </Grid>
      {!task?.taskGroup && (
        <Grid>
          <Typography variant="body2" size={sx={margin: 1 }}>
            <FormattedMessage module="tasksManagement" id="task.approval.taskGroup.requiredHint" />
          </Typography>
        </Grid>
      )}
      <Grid>
        <TaskHistoryDialog
          rights={rights}
          taskId={task.id}
        />
      </Grid>
    </Grid>
  </Grid>
);

class TaskHeadPanel extends FormPanel {
  render() {
    const {
      intl, edited, readOnly, rights,
    } = this.props;
    const task = { ...edited };
    return (
      <>
        {renderHeadPanelTitle(rights, task)}
        <Divider />
        <Grid container component={StyledItem}>
          <Grid size={3} component={StyledItem}>
            <TextInput
              module="tasksManagement"
              label="task.source"
              readOnly={readOnly}
              value={task?.source}
              onChange={(source) => this.updateAttribute('source', source)}
            />
          </Grid>
          <Grid size={3} component={StyledItem}>
            <TextInput
              module="tasksManagement"
              label="task.type"
              readOnly={readOnly}
              value={trimBusinessEvent(task?.businessEvent)}
              onChange={(type) => this.updateAttribute('type', type)}
            />
          </Grid>
          <Grid size={3} component={StyledItem}>
            <TextInput
              module="tasksManagement"
              label="task.entity"
              readOnly={readOnly}
              value={task?.entityString}
              onChange={(entity) => this.updateAttribute('entity', entity)}
            />
          </Grid>
          <Grid size={3} component={StyledItem}>
            <div style={(!task?.taskGroup
              && rights.includes(TASK_UPDATE)
              && ![TASK_STATUS.COMPLETED, TASK_STATUS.FAILED].includes(task.status))
              ? {
                border: '1px solid #d32f2f',
                borderRadius: '4px',
                padding: '4px',
              } : {}}
            >
              <TaskGroupPicker
                module="tasksManagement"
                required
                withLabel
                readOnly={!rights.includes(TASK_UPDATE)
                  || [TASK_STATUS.COMPLETED, TASK_STATUS.FAILED].includes(task.status)}
                withNull
                value={task?.taskGroup}
                onChange={(taskGroup) => this.updateAttribute('taskGroup', taskGroup)}
              />
            </div>
          </Grid>
          <Grid size={3} component={StyledItem}>
            <TextAreaInput
              module="tasksManagement"
              label="task.businessStatus"
              readOnly={readOnly}
              value={task?.businessStatus}
              onChange={(businessStatus) => this.updateAttribute('businessStatus', businessStatus)}
            />
          </Grid>
          <Grid size={3} component={StyledItem}>
            <TaskStatusPicker
              label="task.status"
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

export { StyledTableTitle };
export default withModulesManager(injectIntl(TaskHeadPanel));
