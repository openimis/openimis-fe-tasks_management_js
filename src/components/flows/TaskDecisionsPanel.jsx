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
import { TASK_STATUS } from '../../constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table?.title ?? {},
}));

const StyledItem = styled('div')(({ theme }) => ({
  ...theme.paper?.item ?? {},
}));

const DECISION_REJECTED = 'REJECTED';

/**
 * Batch tasks (CSV imports) carry a verdict per record rather than one for
 * the whole task, so the flat ledger alone makes a reviewer cross-reference
 * UUIDs by eye to answer the question that actually matters at step 2:
 * which rows did an earlier step already throw out?
 *
 * Groups the record-scoped decisions into one row per record, ordered by the
 * step that decided them. A record rejected at any step stays rejected for
 * the rest of the flow, matching how the service derives the surviving set.
 */
const groupByRecord = (decisions) => {
  const byRecord = new Map();
  decisions
    .filter((decision) => decision?.recordId)
    .forEach((decision) => {
      const entry = byRecord.get(decision.recordId) ?? { recordId: decision.recordId, steps: [] };
      entry.steps.push(decision);
      byRecord.set(decision.recordId, entry);
    });
  return [...byRecord.values()].map((entry) => {
    const steps = [...entry.steps].sort(
      (a, b) => (a.flowStep?.order ?? 0) - (b.flowStep?.order ?? 0),
    );
    const rejected = steps.find((step) => step.decision === DECISION_REJECTED);
    return { ...entry, steps, rejectedAt: rejected?.flowStep?.order ?? null };
  });
};

function TaskDecisionsPanel({
  edited, taskDecisions, fetchingTaskDecisions, errorTaskDecisions, fetchedTaskDecisions,
  submittingMutation,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const task = { ...edited };

  useEffect(() => {
    if (task?.id && !submittingMutation) {
      dispatch(fetchTaskDecisions(modulesManager, [`taskId: "${task.id}"`, 'isDeleted: false']));
    }
  }, [task?.id, task?.businessStatus, submittingMutation]);

  const decisionUser = (decision) => [decision?.user?.username, decision?.user?.lastName]
    .filter(Boolean).join(' - ');

  const recordRows = groupByRecord(taskDecisions ?? []);
  const taskClosed = [TASK_STATUS.COMPLETED, TASK_STATUS.FAILED].includes(task?.status);

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
      {fetchedTaskDecisions && recordRows.length > 0 && (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{formatMessage('taskDecision.recordId')}</TableCell>
                <TableCell>{formatMessage('taskDecision.record.progress')}</TableCell>
                <TableCell>{formatMessage('taskDecision.record.outcome')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recordRows.map((row) => (
                <TableRow key={row.recordId}>
                  <TableCell>{row.recordId}</TableCell>
                  <TableCell>
                    {row.steps.map((step) => `#${step.flowStep?.order ?? '-'} ${step.decision}`).join(' · ')}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      if (row.rejectedAt) {
                        return formatMessageWithValues(
                          'taskDecision.record.rejectedAt', { order: row.rejectedAt },
                        );
                      }
                      // Once the task is closed a surviving record is not
                      // "still in review" - it cleared every step and was
                      // handed to the consumer module.
                      return formatMessage(taskClosed
                        ? 'taskDecision.record.approved'
                        : 'taskDecision.record.surviving');
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Divider />
        </>
      )}
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
