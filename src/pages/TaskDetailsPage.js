import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { makeStyles } from '@material-ui/core/styles';
import {
  Form, Helmet,
  useHistory,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import _ from 'lodash';
import TaskHeadPanel from '../components/TaskHeadPanel';
import TaskPreviewPanel from '../components/TaskPreviewPanel';
import { fetchTask, updateTask } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function TaskDetailsPage({
  rights,
  taskUuid,
  task,
  fetchTask,
  updateTask,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);
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
        formatMessage(intl, 'tasksManagement', 'task.update.mutationLabel'),
      );
    }
  };

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('benefitPlanTask.detailsPage.triage.title')} />
      <Form
        module="tasksManagement"
        title={formatMessage('benefitPlanTask.detailsPage.triage.title')}
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

export default connect(mapStateToProps, mapDispatchToProps)(TaskDetailsPage);
