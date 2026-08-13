import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  Divider, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ProgressOrError, useModulesManager, useTranslations, formatDateFromISO,
} from '@openimis/fe-core';
import { fetchTaskDecisions } from '../../actions';

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

function TaskDecisionsPanel({
  edited, taskDecisions, fetchingTaskDecisions, errorTaskDecisions, fetchedTaskDecisions,
  submittingMutation,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);
  const task = { ...edited };

  useEffect(() => {
    if (task?.id && !submittingMutation) {
      dispatch(fetchTaskDecisions(modulesManager, [`taskId: "${task.id}"`, 'isDeleted: false']));
    }
  }, [task?.id, task?.businessStatus, submittingMutation]);

  const decisionUser = (decision) => [decision?.user?.username, decision?.user?.lastName]
    .filter(Boolean).join(' - ');

  const decisionStep = (decision) => (decision?.flowStep
    ? `#${decision.flowStep.order} ${decision.flowStep?.taskGroup?.code ?? ''}`
    : formatMessage('taskDecision.flatTask'));

  return (
    <StyledPaper>
      <Grid container component={StyledTableTitle}>
        <Grid component={StyledItem}>
          <Typography>
            {formatMessage('taskDecision.panelTitle')}
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <ProgressOrError progress={fetchingTaskDecisions} error={errorTaskDecisions} />
      {fetchedTaskDecisions && (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{formatMessage('taskDecision.step')}</TableCell>
              <TableCell>{formatMessage('taskDecision.user')}</TableCell>
              <TableCell>{formatMessage('taskDecision.decision')}</TableCell>
              <TableCell>{formatMessage('taskDecision.recordId')}</TableCell>
              <TableCell>{formatMessage('taskDecision.date')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskDecisions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2">
                    {formatMessage('taskDecision.empty')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {taskDecisions.map((decision) => (
              <TableRow key={decision.uuid}>
                <TableCell>{decisionStep(decision)}</TableCell>
                <TableCell>{decisionUser(decision)}</TableCell>
                <TableCell>{decision.decision}</TableCell>
                <TableCell>{decision.recordId}</TableCell>
                <TableCell>
                  {formatDateFromISO(modulesManager, null, decision.dateCreated)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </StyledPaper>
  );
}

const mapStateToProps = (state) => ({
  taskDecisions: state.tasksManagement.taskDecisions,
  fetchingTaskDecisions: state.tasksManagement.fetchingTaskDecisions,
  fetchedTaskDecisions: state.tasksManagement.fetchedTaskDecisions,
  errorTaskDecisions: state.tasksManagement.errorTaskDecisions,
  submittingMutation: state.tasksManagement.submittingMutation,
});

export default connect(mapStateToProps)(TaskDecisionsPanel);
