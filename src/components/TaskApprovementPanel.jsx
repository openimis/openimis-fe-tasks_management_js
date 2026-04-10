import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Paper, Fab,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  GetIconComponent,
  useTranslations,
  useModulesManager, coreConfirm, clearConfirm, journalize,
} from '@openimis/fe-core';
import {
  APPROVED, EMPTY_STRING,
  FAILED, TASK_STATUS,
  TASK_CONTRIBUTION_KEY,
} from '../constants';
import { resolveTask } from '../actions';
const ClearIcon = GetIconComponent("Clear");
const CheckIcon = GetIconComponent("Check");
const StyledPaper = styled('div')(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTitle = styled('div')(({ theme }) => ({
  ...theme.paper?.title ?? {},
}));

const StyledButton = styled('div')(({ theme }) => ({
  ...theme.paper?.button ?? {},
}));

const StyledFabContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
}));

const StyledFab = styled('div')(({ theme }) => ({
  margin: theme.spacing(1),
}));

function TaskApprovementPanel({
  edited,
  user,
  resolveTask,
  submittingMutation,
  coreConfirm,
  clearConfirm,
  mutation,
  journalize,
  confirmed,
  additionalData,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);
  const prevSubmittingMutationRef = useRef();
  const [approveOrFail, setApproveOrFail] = useState(EMPTY_STRING);
  const [disable, setDisable] = useState(false);
  const task = { ...edited };

  useEffect(() => {
    if (task?.businessStatus && user) {
      const businesStatus = JSON.parse(task.businessStatus);
      if (Object.keys(businesStatus).includes(user?.id)) {
        setDisable(true);
      } else {
        setDisable(false);
      }
    }
  }, [task.businessStatus, user]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => {
    if (task?.id && user?.id) {
      if (confirmed) {
        setDisable(true);
        resolveTask(
          task,
          formatMessage('task.resolve.mutationLabel'),
          user,
          approveOrFail,
          additionalData,
        );
      }
    }
  }, [confirmed]);

  const openResolveTaskConfirmDialog = (choiceString) => coreConfirm(
    formatMessage('task.resolve.confirm.title'),
    choiceString === APPROVED ? formatMessage('task.resolve.confirm.approve.message')
      : formatMessage('task.resolve.confirm.fail.message'),
  );

  const handleButtonClick = (choiceString) => {
    if (task?.id && user?.id) {
      openResolveTaskConfirmDialog(choiceString);
      setApproveOrFail(choiceString);
    }
  };

  if (task.source) {
    const contrib = modulesManager.getContribs(TASK_CONTRIBUTION_KEY)
      .find((c) => c.taskSource.includes(task.source));

    if (contrib?.confirmationPanel) {
      return (
        <contrib.confirmationPanel
          task
          defaultAction={handleButtonClick}
          defaultDisabled={disable}
        />
      );
    }
  }

  return (
    <Paper component={StyledPaper}>
      <StyledFabContainer>
        <StyledFab>
          <Fab
            color="primary"
            disabled={task.status === TASK_STATUS.RECEIVED || disable}
            onClick={() => handleButtonClick(APPROVED)}
          >
            <CheckIcon />
          </Fab>
        </StyledFab>
        <StyledFab>
          <Fab
            color="primary"
            disabled={task.status === TASK_STATUS.RECEIVED || disable}
            onClick={() => handleButtonClick(FAILED)}
          >
            <ClearIcon />
          </Fab>
        </StyledFab>
      </StyledFabContainer>
    </Paper>
  );
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  user: !!state.core && !!state.core.user ? state.core.user : null,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  resolveTask,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export { StyledPaper };
export default connect(mapStateToProps, mapDispatchToProps)(TaskApprovementPanel);
