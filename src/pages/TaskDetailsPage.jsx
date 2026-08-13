import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { styled } from '@mui/material/styles';
import {
  Form, Helmet,
  useHistory,
  useModulesManager,
  useTranslations,
  decodeId,
  coreAlert,
} from '@openimis/fe-core';
import _ from 'lodash';
import TaskHeadPanel from '../components/TaskHeadPanel';
import TaskPreviewPanel from '../components/TaskPreviewPanel';
import TaskApprovementPanel from '../components/TaskApprovementPanel';
import TaskFlowStepper from '../components/flows/TaskFlowStepper';
import TaskDecisionsPanel from '../components/flows/TaskDecisionsPanel';
import { clearTask, fetchTask, updateTask } from '../actions';
import { TASK_STATUS as taskStatus } from '../constants';

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

function TaskDetailsPage({
  rights,
  taskUuid,
  task,
  fetchTask,
  updateTask,
  currentUser,
  submittingMutation,
  mutation,
  clearTask,
  coreAlert,
  hideBody = false,
}) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [editedTask, setEditedTask] = useState({});
  const [additionalData, setAdditionalData] = useState(null);
  const submittingMutationRef = useRef();
  const prevTaskRef = useRef();
  const back = () => history.goBack();

  useEffect(() => {
    if (taskUuid) {
      fetchTask(modulesManager, [`id: "${taskUuid}"`]);
    }
  }, [taskUuid]);

  useEffect(() => {
    if (submittingMutationRef.current && !submittingMutation && mutation?.clientMutationId) {
      fetchTask(modulesManager, [`clientMutationId: "${mutation.clientMutationId}"`]);
    }
    submittingMutationRef.current = submittingMutation;
  }, [submittingMutation]);

  useEffect(() => {
    if (task) {
      // A refetch showing a higher step order means this viewer's approval
      // advanced a flow task - name the handoff instead of letting the task
      // silently vanish from their list.
      const prevTask = prevTaskRef.current;
      if (
        prevTask?.id && prevTask.id === task.id
        && task?.flow && task.status === taskStatus.ACCEPTED
        && prevTask?.currentStep?.order != null
        && task?.currentStep?.order > prevTask.currentStep.order
      ) {
        coreAlert(
          formatMessage('task.flow.advanced.title'),
          formatMessageWithValues('task.flow.advanced.message', {
            order: task.currentStep.order,
            group: task?.taskGroup?.code ?? '?',
          }),
        );
      }
      prevTaskRef.current = task;
      setEditedTask(task);
    }
  }, [task]);

  useEffect(() => () => {
    clearTask();
  }, []);

  const doesTaskChange = () => {
    if (_.isEqual(task, editedTask)) return false;
    return true;
  };

  const isMandatoryFieldsEmpty = () => !editedTask?.taskGroup;

  const canSave = () => !isMandatoryFieldsEmpty() && doesTaskChange();

  const handleSave = () => {
    if (task?.id) {
      updateTask(
        editedTask,
        formatMessage('task.update.mutationLabel'),
      );
    }
  };

  const isCurrentUserInTaskGroup = () => {
    const taskExecutors = task?.taskGroup?.taskexecutorSet?.edges.map((edge) => decodeId(edge.node.user.id)) ?? [];
    return taskExecutors && taskExecutors.includes(currentUser?.id);
  };

  const panels = () => {
    const panels = [];
    // Flow tasks read top-down: situation (stepper) -> subject (preview) ->
    // history (decisions) -> act (approvement). Flat tasks render as before.
    if (task?.flow) {
      panels.push(TaskFlowStepper);
    }
    if (!hideBody) {
      panels.push(TaskPreviewPanel);
    }
    if (task?.flow) {
      panels.push(TaskDecisionsPanel);
    }
    if (task && isCurrentUserInTaskGroup() && task.status === taskStatus.ACCEPTED) {
      panels.push(TaskApprovementPanel);
    }
    return panels;
  };

  return (
    <StyledPage>
      <Helmet title={formatMessage('task.detailsPage.triage.title')} />
      <Form
        module="tasksManagement"
        title={formatMessage('task.detailsPage.triage.title')}
        openDirty
        edited={editedTask}
        onEditedChanged={setEditedTask}
        back={back}
        mandatoryFieldsEmpty={isMandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        readOnly
        HeadPanel={TaskHeadPanel}
        formatMessage={formatMessage}
        Panels={panels()}
        rights={rights}
        additionalData={additionalData}
        setAdditionalData={setAdditionalData}
        saveTooltip={formatMessage(
          `tasksManagement.saveButton.tooltip.${canSave() ? 'enabled' : 'disabled'}`,
        )}
      />
    </StyledPage>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTask,
  updateTask,
  clearTask,
  coreAlert,
}, dispatch);

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  currentUser: !!state.core && !!state?.core?.user ? state.core.user : null,
  taskUuid: props?.match?.params?.task_uuid,
  submittingMutation: state.tasksManagement.submittingMutation,
  mutation: state.tasksManagement.mutation,
  task: state.tasksManagement.task,
  fetchingTask: state.tasksManagement.fetchingTask,
  fetchedTask: state.tasksManagement.fetchedTask,
  errorTask: state.tasksManagement.errorTask,
});

export { StyledPage };
export default connect(mapStateToProps, mapDispatchToProps)(TaskDetailsPage);
