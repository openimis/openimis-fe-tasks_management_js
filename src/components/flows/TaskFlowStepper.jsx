import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  Paper, Step, StepLabel, Stepper, Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  useModulesManager, useTranslations, decodeId,
} from '@openimis/fe-core';
import { fetchTaskFlow } from '../../actions';
import { GROUP_RESOLVE_POLICY, TASK_STATUS } from '../../constants';

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledWarning = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  padding: theme.spacing(0, 2, 1, 2),
}));

const stepPolicyText = (step) => {
  const policy = step?.effectivePolicy;
  if (policy === GROUP_RESOLVE_POLICY.N && step?.effectiveThreshold) {
    return `${policy}=${step.effectiveThreshold}`;
  }
  return policy ?? '';
};

function TaskFlowStepper({
  edited, taskFlow, fetchingTaskFlow,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const task = { ...edited };

  const flowUuid = task?.flow?.uuid;

  // Depends on the store value too, not just flowUuid: a late response for a
  // previously viewed flow can overwrite the shared slice after this one
  // loaded. The guard below then hides the stepper, and without re-running
  // here nothing would ever fetch the right flow again.
  useEffect(() => {
    if (flowUuid && taskFlow?.uuid !== flowUuid && !fetchingTaskFlow) {
      dispatch(fetchTaskFlow(modulesManager, { taskFlowUuid: flowUuid }));
    }
  }, [flowUuid, taskFlow?.uuid, fetchingTaskFlow]);

  if (!flowUuid || fetchingTaskFlow || taskFlow?.uuid !== flowUuid) return null;

  const steps = taskFlow?.steps ?? [];
  const currentStepUuid = task?.currentStep?.id ? decodeId(task.currentStep.id) : task?.currentStep?.uuid;
  const currentIndex = steps.findIndex((step) => step.uuid === currentStepUuid);
  const completed = task?.status === TASK_STATUS.COMPLETED;
  const failed = task?.status === TASK_STATUS.FAILED;
  const activeStep = completed ? steps.length : Math.max(currentIndex, 0);
  const currentStep = currentIndex >= 0 ? steps[currentIndex] : null;
  const currentPoolEmpty = !failed && !completed
    && currentStep?.taskGroup?.taskexecutorSet?.totalCount === 0;

  return (
    <StyledPaper>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => (
          <Step key={step.uuid} completed={completed || index < currentIndex}>
            <StepLabel
              error={failed && index === currentIndex}
              optional={(
                <Typography variant="caption">{stepPolicyText(step)}</Typography>
              )}
            >
              {step?.taskGroup?.code ?? formatMessage('taskFlow.step.unknownPool')}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {currentPoolEmpty && (
        <StyledWarning variant="body2">
          {formatMessageWithValues('taskFlow.step.heldEmptyPool', {
            group: currentStep?.taskGroup?.code ?? '?',
          })}
        </StyledWarning>
      )}
    </StyledPaper>
  );
}

const mapStateToProps = (state) => ({
  taskFlow: state.tasksManagement.taskFlow,
  fetchingTaskFlow: state.tasksManagement.fetchingTaskFlow,
});

export default connect(mapStateToProps)(TaskFlowStepper);
