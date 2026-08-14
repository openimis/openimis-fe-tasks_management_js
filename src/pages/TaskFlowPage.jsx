import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { styled } from '@mui/material/styles';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Form, Helmet, useTranslations, useModulesManager, useHistory, clearConfirm, journalize, coreConfirm,
  GetIconComponent,
} from '@openimis/fe-core';
import _ from 'lodash';
import TaskFlowHeadPanel from '../components/flows/TaskFlowHeadPanel';
import TaskFlowStepsEditor from '../components/flows/TaskFlowStepsEditor';
import { EMPTY_STRING, GROUP_RESOLVE_POLICY } from '../constants';
import {
  fetchTaskFlow, clearTaskFlow, deleteTaskFlow, updateTaskFlow, createTaskFlow, replaceTaskFlow,
} from '../actions';
import { ACTION_TYPE } from '../reducer';

const DeleteIcon = GetIconComponent('Delete');

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

// Steps compare on what the BE persists: pool, override policy, threshold
const stepsFingerprint = (steps) => (steps ?? []).map((step) => [
  step?.taskGroup?.uuid ?? step?.taskGroup?.id ?? null,
  step?.completionPolicy ?? null,
  step?.threshold ?? null,
]);

function TaskFlowPage({
  rights, taskFlow, taskFlowUuid, confirmed, journalize, mutation, submittingMutation, coreConfirm,
}) {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [editedTaskFlow, setEditedTaskFlow] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  // fe-core Form releases its internal saving/dirty latch only when its
  // `reset` (or `edited_id`) prop changes; without this the save Fab stays
  // disabled after the first mutation on a page that is not remounted.
  const [formResetKey, setFormResetKey] = useState(0);
  const prevSubmittingMutationRef = useRef();
  const back = () => history.goBack();

  const superseded = !!taskFlow?.replacementUuid;

  const titleParams = (flow) => ({
    code: flow?.code ?? EMPTY_STRING,
  });

  useEffect(() => {
    if (taskFlowUuid) {
      dispatch(fetchTaskFlow(modulesManager, { taskFlowUuid }));
    }
  }, [taskFlowUuid]);

  const stepsDirty = () => !_.isEqual(
    stepsFingerprint(taskFlow?.steps),
    stepsFingerprint(editedTaskFlow?.steps),
  );

  const mandatoryFieldsEmpty = () => {
    const code = editedTaskFlow?.code?.trim();
    const steps = editedTaskFlow?.steps ?? [];
    if (!code || !steps.length) return true;
    return steps.some((step) => !step?.taskGroup
      || (step?.completionPolicy === GROUP_RESOLVE_POLICY.N && !(step?.threshold >= 1)));
  };

  const doesFlowChange = () => !_.isEqual(taskFlow, editedTaskFlow);

  const canSave = () => !superseded && !mandatoryFieldsEmpty() && doesFlowChange();

  const doReplace = useCallback(() => dispatch(replaceTaskFlow(
    editedTaskFlow,
    formatMessageWithValues('taskFlow.replace.mutationLabel', { code: editedTaskFlow?.code }),
  )), [editedTaskFlow]);

  // One contextual save: a steps change is semantic and creates a new
  // version (after naming the blast radius); name/source-only changes are
  // plain head updates.
  const handleSave = () => {
    if (!taskFlow?.id) {
      dispatch(createTaskFlow(
        editedTaskFlow,
        formatMessageWithValues('taskFlow.create.mutationLabel', { code: editedTaskFlow?.code }),
      ));
      return;
    }
    if (stepsDirty()) {
      setConfirmedAction(() => doReplace);
      coreConfirm(
        formatMessageWithValues('taskFlow.replace.confirm.title', { code: taskFlow?.code }),
        formatMessageWithValues('taskFlow.replace.confirm.message', {
          version: taskFlow?.version ?? 1,
          newVersion: (taskFlow?.version ?? 1) + 1,
          inFlightCount: taskFlow?.inFlightCount ?? 0,
        }),
      );
      return;
    }
    dispatch(updateTaskFlow(
      editedTaskFlow,
      formatMessageWithValues('taskFlow.update.mutationLabel', { code: editedTaskFlow?.code }),
    ));
  };

  const deleteTaskFlowCallback = () => dispatch(deleteTaskFlow(
    taskFlow,
    formatMessageWithValues('taskFlow.delete.mutationLabel', { code: taskFlow?.code }),
  ));

  const openDeleteTaskFlowConfirmDialog = () => {
    setConfirmedAction(() => deleteTaskFlowCallback);
    coreConfirm(
      formatMessageWithValues('taskFlow.delete.confirm.title', { code: taskFlow?.code }),
      formatMessage('taskFlow.delete.confirm.message'),
    );
  };

  const actions = [
    !!taskFlow?.id && !superseded && {
      doIt: openDeleteTaskFlowConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('deleteButton.tooltip'),
    },
  ].filter(Boolean);

  useEffect(() => {
    // `confirmed` can still be true from a confirm raised on another page, so
    // guard the callback: it is null until this page arms one.
    if (confirmed && confirmedAction) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      setFormResetKey((key) => key + 1);
      if (mutation?.actionType === ACTION_TYPE.DELETE_TASK_FLOW) {
        back();
      }
      if (mutation?.actionType === ACTION_TYPE.REPLACE_TASK_FLOW && taskFlow?.code) {
        // The replace superseded this row; re-fetch the new head by code and
        // stay on the page (the uuid in the URL is now the old version).
        dispatch(fetchTaskFlow(modulesManager, { code: taskFlow.code }));
      }
      if (mutation?.actionType === ACTION_TYPE.CREATE_TASK_FLOW && editedTaskFlow?.code) {
        dispatch(fetchTaskFlow(modulesManager, { code: editedTaskFlow.code }));
      }
      if (mutation?.actionType === ACTION_TYPE.UPDATE_TASK_FLOW && taskFlow?.uuid) {
        // Sync redux with the persisted head so the dirty compare restarts
        // from the saved state.
        dispatch(fetchTaskFlow(modulesManager, { taskFlowUuid: taskFlow.uuid }));
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => {
    // A refetch that yields nothing (e.g. the head lookup right after a
    // mutation) must not blank the edited record out to undefined - the
    // head panel's pickers read arrays off it.
    setEditedTaskFlow(taskFlow ?? {});
  }, [taskFlow]);

  useEffect(() => () => dispatch(clearTaskFlow()), []);

  const StepsPanel = useCallback(({ edited, onEditedChanged }) => (
    <TaskFlowStepsEditor
      steps={edited?.steps ?? []}
      readOnly={superseded}
      onChange={(steps) => onEditedChanged({ ...edited, steps })}
    />
  ), [superseded]);

  return (
    <StyledPage>
      <Helmet title={formatMessageWithValues('taskFlow.detailsPage.title', titleParams(editedTaskFlow))} />
      <Form
        module="tasksManagement"
        title={formatMessageWithValues('taskFlow.detailsPage.title', titleParams(editedTaskFlow))}
        titleParams={titleParams(editedTaskFlow)}
        openDirty
        reset={formResetKey}
        edited={editedTaskFlow}
        onEditedChanged={setEditedTaskFlow}
        back={back}
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={TaskFlowHeadPanel}
        Panels={[StepsPanel]}
        readOnly={superseded}
        formatMessage={formatMessage}
        rights={rights}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        saveTooltip={formatMessage(
          `taskFlow.saveButton.tooltip.${stepsDirty() && taskFlow?.id ? 'newVersion' : 'save'}`,
        )}
      />
    </StyledPage>
  );
}

const mapStateToProps = (state, props) => ({
  rights: state?.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.tasksManagement.submittingMutation,
  mutation: state.tasksManagement.mutation,
  taskFlowUuid: props.match.params.task_flow_uuid,
  taskFlow: state.tasksManagement.taskFlow,
  fetchingTaskFlow: state.tasksManagement.fetchingTaskFlow,
  errorTaskFlow: state.tasksManagement.errorTaskFlow,
  fetchedTaskFlow: state.tasksManagement.fetchedTaskFlow,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TaskFlowPage);
