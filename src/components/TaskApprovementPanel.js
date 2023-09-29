import React, { useEffect, useRef, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  makeStyles, Paper, Fab,
} from '@material-ui/core';
import {
  useTranslations,
  useModulesManager, coreConfirm, clearConfirm, journalize,
} from '@openimis/fe-core';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import {
  APPROVED, EMPTY_STRING,
  FAILED, TASK_STATUS,
} from '../constants';
import { resolveTask } from '../actions';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  title: theme.paper.title,
  button: theme.paper.button,
  fabContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  fab: {
    margin: theme.spacing(1),
  },
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
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
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
        );
      }
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  const openResolveTaskConfirmDialog = () => coreConfirm(
    formatMessage('task.resolve.confirm.title'),
    approveOrFail === APPROVED ? formatMessage('task.resolve.confirm.fail.message')
      : formatMessage('task.resolve.confirm.approve.message'),
  );

  const handleButtonClick = (choiceString) => {
    if (task?.id && user?.id) {
      openResolveTaskConfirmDialog(approveOrFail);
      setApproveOrFail(choiceString);
    }
  };

  return (
    <Paper className={classes.paper}>
      <div className={classes.fabContainer}>
        <div className={classes.fab}>
          <Fab
            color="primary"
            disabled={task.status === TASK_STATUS.RECEIVED || disable}
            onClick={() => handleButtonClick(APPROVED)}
          >
            <CheckIcon />
          </Fab>
        </div>
        <div className={classes.fab}>
          <Fab
            color="primary"
            disabled={task.status === TASK_STATUS.RECEIVED || disable}
            onClick={() => handleButtonClick(FAILED)}
          >
            <ClearIcon />
          </Fab>
        </div>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TaskApprovementPanel);
