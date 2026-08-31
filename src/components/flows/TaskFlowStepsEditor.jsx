import React from 'react';
import {
  Divider, Grid, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Tooltip, Typography, Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  NumberInput, useModulesManager, useTranslations, GetIconComponent,
} from '@openimis/fe-core';
import GroupPolicyPicker from '../../pickers/GroupPolicyPicker';
import TaskGroupPicker from '../../pickers/TaskGroupPicker';
import { GROUP_RESOLVE_POLICY } from '../../constants';

const AddIcon = GetIconComponent('Add');
const DeleteIcon = GetIconComponent('Delete');
const ArrowUpwardIcon = GetIconComponent('ArrowUpward');
const ArrowDownwardIcon = GetIconComponent('ArrowDownward');

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

// Effective policy of a row: explicit override, else the pool group's policy
const effectivePolicy = (step) => step?.completionPolicy ?? step?.taskGroup?.completionPolicy;

function TaskFlowStepsEditor({ steps = [], onChange, readOnly }) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);

  const updateStep = (index, changes) => {
    const updated = steps.map((step, i) => (i === index ? { ...step, ...changes } : step));
    onChange(updated);
  };

  const addStep = () => onChange([...steps, { taskGroup: null, completionPolicy: null, threshold: null }]);

  const removeStep = (index) => onChange(steps.filter((_, i) => i !== index));

  const moveStep = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    const reordered = [...steps];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  };

  const onPolicyChange = (index) => (completionPolicy) => {
    // Threshold only accompanies an explicit N override; clear it otherwise
    const changes = { completionPolicy: completionPolicy || null };
    if (completionPolicy !== GROUP_RESOLVE_POLICY.N) changes.threshold = null;
    updateStep(index, changes);
  };

  const inheritHint = (step) => {
    if (step?.completionPolicy || !step?.taskGroup) return null;
    const policy = step.taskGroup.completionPolicy;
    const threshold = step.taskGroup.threshold;
    return formatMessageWithValues('taskFlow.step.inheritHint', {
      policy: policy && policy === GROUP_RESOLVE_POLICY.N && threshold
        ? `${policy}=${threshold}` : policy ?? '?',
    });
  };

  return (
    <StyledPaper>
      <Grid container component={StyledTableTitle}>
        <Grid component={StyledItem}>
          <Typography>
            {formatMessage('taskFlow.steps.panelTitle')}
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{formatMessage('taskFlow.step.order')}</TableCell>
            <TableCell>{formatMessage('taskFlow.step.taskGroup')}</TableCell>
            <TableCell>{formatMessage('taskFlow.step.completionPolicy')}</TableCell>
            <TableCell>{formatMessage('taskFlow.step.threshold')}</TableCell>
            {!readOnly && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {steps.length === 0 && (
            <TableRow>
              <TableCell colSpan={readOnly ? 4 : 5}>
                <Typography variant="body2">
                  {formatMessage('taskFlow.steps.empty')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {steps.map((step, index) => (
            /* eslint-disable-next-line react/no-array-index-key */
            <TableRow key={index}>
              <TableCell width="5%">{index + 1}</TableCell>
              <TableCell width="35%">
                <TaskGroupPicker
                  withLabel={false}
                  readOnly={readOnly}
                  value={step.taskGroup}
                  onChange={(taskGroup) => updateStep(index, { taskGroup })}
                />
              </TableCell>
              <TableCell width="25%">
                <GroupPolicyPicker
                  withLabel={false}
                  readOnly={readOnly}
                  withNull
                  nullLabel={formatMessage('taskFlow.step.policy.inherit')}
                  value={step.completionPolicy}
                  onChange={onPolicyChange(index)}
                />
                {inheritHint(step) && (
                  <Typography variant="caption" color="textSecondary">
                    {inheritHint(step)}
                  </Typography>
                )}
              </TableCell>
              <TableCell width="15%">
                {effectivePolicy(step) === GROUP_RESOLVE_POLICY.N && step.completionPolicy ? (
                  <NumberInput
                    module="tasksManagement"
                    label="taskFlow.step.threshold"
                    readOnly={readOnly}
                    min={1}
                    value={step.threshold}
                    onChange={(threshold) => updateStep(index, { threshold })}
                  />
                ) : null}
              </TableCell>
              {!readOnly && (
                <TableCell width="20%" align="right">
                  <Tooltip title={formatMessage('taskFlow.step.moveUp')}>
                    <span>
                      <IconButton size="small" disabled={index === 0} onClick={() => moveStep(index, -1)}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={formatMessage('taskFlow.step.moveDown')}>
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === steps.length - 1}
                        onClick={() => moveStep(index, 1)}
                      >
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={formatMessage('taskFlow.step.remove')}>
                    <IconButton size="small" onClick={() => removeStep(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!readOnly && (
        <Grid container component={StyledItem}>
          <Grid>
            <Button startIcon={<AddIcon />} onClick={addStep}>
              {formatMessage('taskFlow.steps.addStep')}
            </Button>
          </Grid>
        </Grid>
      )}
    </StyledPaper>
  );
}

export default TaskFlowStepsEditor;
