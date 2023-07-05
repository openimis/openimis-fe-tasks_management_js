import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { bindActionCreators } from 'redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import {
  Form, Helmet,
  withHistory,
  withModulesManager,
  formatMessage,
} from '@openimis/fe-core';
import TaskHeadPanel from '../components/TaskHeadPanel';
import TaskPreviewPanel from '../components/TaskPreviewPanel';
import { fetchTask, updateTask } from '../actions';

const styles = (theme) => ({
  page: theme.page,
});

function TaskDetailsPage({
  intl,
  rights,
  taskUuid,
  task,
  history,
  modulesManager,
  classes,
  fetchTask,
  updateTask,
}) {
  const [editedTask, setEditedTask] = useState({});
  const back = () => history.goBack();

  useEffect(() => {
    if (taskUuid) {
      fetchTask(modulesManager, [`id: "${taskUuid}"`]);
    }
  }, [taskUuid]);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  const isMandatoryFieldsEmpty = () => !editedTask?.taskGroup;

  const canSave = () => !isMandatoryFieldsEmpty();

  const handleSave = () => {
    if (task?.id) {
      updateTask(
        editedTask,
        formatMessage(intl, 'tasksManagement', 'task.update.mutationLabel'),
      );
    }
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage(intl, 'tasksManagement', 'benefitPlanTask.detailsPage.triage.title')} />
      <Form
        module="tasksManagement"
        title={formatMessage(intl, 'tasksManagement', 'benefitPlanTask.detailsPage.triage.title')}
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
        Panels={[TaskPreviewPanel]}
        rights={rights}
        saveTooltip={formatMessage(
          intl,
          'socialProtection',
          `benefitPlan.saveButton.tooltip.${canSave() ? 'enabled' : 'disabled'}`,
        )}
      />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTask,
  updateTask,
}, dispatch);

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  taskUuid: props.match.params.task_uuid,
  task: state.tasksManagement.task,
});

export default withHistory(
  withModulesManager(injectIntl(withTheme(withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(
      TaskDetailsPage,
    ),
  )))),
);
