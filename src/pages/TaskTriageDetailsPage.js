import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import {
  Form, Helmet, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import TaskHeadPanel from '../components/TaskHeadPanel';
import TaskPreviewPanel from '../components/TaskPreviewPanel';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function TaskTriageDetailsPage() {
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [editedTask, setEditedTask] = useState({});
  const back = () => history.goBack();

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
        readOnly
        // mandatoryFieldsEmpty={isMandatoryFieldsEmpty}
        // canSave={canSave}
        // save={handleSave}
        HeadPanel={TaskHeadPanel}
        formatMessage={formatMessage}
        formatMessageWithValues={formatMessageWithValues}
        Panels={[TaskPreviewPanel]}
        rights={rights}
        // actions={actions}
        // setConfirmedAction={setConfirmedAction}
        // saveTooltip={formatMessage(intl, 'individual', `saveButton.tooltip.${canSave ? 'enabled' : 'disabled'}`)}
      />
    </div>
  );
}

export default TaskTriageDetailsPage;
