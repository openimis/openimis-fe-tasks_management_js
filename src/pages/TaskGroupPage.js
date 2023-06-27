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

  const mandatoryFieldsEmpty = () => !editedTaskGroup?.code
  || !editedTaskGroup?.completionPolicy || !editedTaskGroup?.executors?.length;

  const doesTaskGroupChange = () => {
    if (_.isEqual(taskGroup, editedTaskGroup)) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty() && doesTaskGroupChange();

  const handleSave = () => {
    if (taskGroup?.id) {
      dispatch(updateTaskGroup(
        editedTaskGroup,
        formatMessageWithValues('taskGroup.update.mutationLabel', titleParams(editedTaskGroup)),
      ));
    } else {
      dispatch(createTaskGroup(
        editedTaskGroup,
        formatMessageWithValues('taskGroup.create.mutationLabel', titleParams(editedTaskGroup)),
      ));
    }
  };

  const deleteTaskGroupCallback = () => dispatch(deleteTaskGroup(
    taskGroup,
    formatMessageWithValues('taskGroup.delete.mutationLabel', titleParams(taskGroup)),
  ));

  const openDeleteTaskGroupConfirmDialog = () => {
    setConfirmedAction(() => deleteTaskGroupCallback);
    coreConfirm(
      formatMessageWithValues('taskGroup.delete.confirm.title', titleParams(editedTaskGroup)),
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
    const storedTaskGroup = { ...taskGroup };
    const currentExecutors = storedTaskGroup?.taskexecutorSet?.edges?.map((executor) => executor.node.user);

    delete storedTaskGroup.taskexecutorSet;

    const formattedTaskGroup = { ...storedTaskGroup, executors: currentExecutors };

    setEditedTaskGroup(formattedTaskGroup);
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
