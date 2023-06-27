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

function TaskDetailsPage() {
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);
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
        HeadPanel={TaskHeadPanel}
        formatMessage={formatMessage}
        Panels={[TaskPreviewPanel]}
        rights={rights}
      />
    </div>
  );
}

export default TaskDetailsPage;
