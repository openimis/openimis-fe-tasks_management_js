import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/styles';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Form, Helmet, useTranslations, useModulesManager, useHistory, clearConfirm, journalize, coreConfirm,
} from '@openimis/fe-core';
import DeleteIcon from '@material-ui/icons/Delete';
import _ from 'lodash';
import TaskGroupHeadPanel from '../components/groups-management/TaskGroupHeadPanel';
import { EMPTY_STRING } from '../constants';
import {
  fetchTaskGroup, clearTaskGroup, deleteTaskGroup, updateTaskGroup, createTaskGroup,
} from '../actions';
import { ACTION_TYPE } from '../reducer';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function TaskGroupPage({
  rights, taskGroup, taskGroupUuid, confirmed, journalize, mutation, submittingMutation, coreConfirm,
}) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [editedTaskGroup, setEditedTaskGroup] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();
  const back = () => history.goBack();

  const titleParams = (taskGroup) => ({
    code: taskGroup?.code ?? EMPTY_STRING,
  });

  useEffect(() => {
    if (taskGroupUuid) {
      dispatch(fetchTaskGroup(modulesManager, { taskGroupUuid }));
    }
  }, [taskGroupUuid]);

  const mandatoryFieldsEmpty = () => {
    const code = editedTaskGroup?.code?.trim();
    return !code || !editedTaskGroup?.completionPolicy || !editedTaskGroup?.taskexecutorSet?.length;
  };

  const doesTaskGroupChange = () => !_.isEqual(taskGroup, editedTaskGroup);

  const canSave = () => !mandatoryFieldsEmpty() && doesTaskGroupChange();

  const handleSave = () => {
    if (taskGroup?.id) {
      dispatch(updateTaskGroup(
        editedTaskGroup,
        formatMessageWithValues('taskGroup.update.mutationLabel', {
          id: editedTaskGroup?.id,
        }),
      ));
    } else {
      dispatch(createTaskGroup(
        editedTaskGroup,
        formatMessageWithValues('taskGroup.create.mutationLabel', {
          id: editedTaskGroup?.id,
        }),
      ));
    }
  };

  const deleteTaskGroupCallback = () => dispatch(deleteTaskGroup(
    taskGroup,
    formatMessageWithValues('taskGroup.delete.mutationLabel', {
      id: taskGroup?.id,
    }),
  ));

  const openDeleteTaskGroupConfirmDialog = () => {
    setConfirmedAction(() => deleteTaskGroupCallback);
    coreConfirm(
      formatMessageWithValues('taskGroup.delete.confirm.title', {
        id: taskGroup?.id,
      }),
      formatMessage('taskGroup.delete.confirm.message'),
    );
  };

  const actions = [
    !!taskGroup?.id && {
      doIt: openDeleteTaskGroupConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('deleteButton.tooltip'),
    },
  ];

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_TASK_GROUP) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => {
    setEditedTaskGroup(taskGroup);
  }, [taskGroup]);

  useEffect(() => () => dispatch(clearTaskGroup()), []);

  return (
    <div className={classes.page}>
      <Helmet title={formatMessageWithValues('taskGroup.detailsPage.title', titleParams(editedTaskGroup))} />
      <Form
        module="tasksManagement"
        title={formatMessageWithValues('taskGroup.detailsPage.title', titleParams(editedTaskGroup))}
        titleParams={titleParams(editedTaskGroup)}
        openDirty
        edited={editedTaskGroup}
        onEditedChanged={setEditedTaskGroup}
        back={back}
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={TaskGroupHeadPanel}
        formatMessage={formatMessage}
        rights={rights}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        saveTooltip={formatMessage('saveButton.tooltip')}
      />
    </div>
  );
}

const mapStateToProps = (state, props) => ({
  rights: state?.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.tasksManagement.submittingMutation,
  mutation: state.tasksManagement.mutation,
  taskGroupUuid: props.match.params.task_group_uuid,
  taskGroup: state.tasksManagement.taskGroup,
  fetchingTaskGroup: state.tasksManagement.fetchingTaskGroup,
  errorTaskGroup: state.tasksManagement.errorTaskGroup,
  fetchedTaskGroup: state.tasksManagement.fetchedTaskGroup,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TaskGroupPage);
