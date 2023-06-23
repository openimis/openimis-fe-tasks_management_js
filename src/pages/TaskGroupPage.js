import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { useSelector } from 'react-redux';
import {
  Form, Helmet, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import TaskGroupHeadPanel from '../components/groups-management/TaskGroupHeadPanel';
import { EMPTY_STRING } from '../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function TaskGroupPage() {
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [editedTaskGroup, setEditedTaskGroup] = useState({});
  const back = () => history.goBack();

  return (
    <div className={classes.page}>
      <Helmet title={
        formatMessageWithValues('taskGroup.detailsPage.title', { code: editedTaskGroup?.code ?? EMPTY_STRING })
        }
      />
      <Form
        module="tasksManagement"
        title={formatMessageWithValues('taskGroup.detailsPage.title', { code: editedTaskGroup?.code ?? EMPTY_STRING })}
        openDirty
        edited={editedTaskGroup}
        onEditedChanged={setEditedTaskGroup}
        back={back}
        // mandatoryFieldsEmpty={isMandatoryFieldsEmpty}
        // canSave={canSave}
        // save={handleSave}
        HeadPanel={TaskGroupHeadPanel}
        formatMessage={formatMessage}
        rights={rights}
        // actions={actions}
        // setConfirmedAction={setConfirmedAction}
        // saveTooltip={formatMessage(intl, 'individual', `saveButton.tooltip.${canSave ? 'enabled' : 'disabled'}`)}
      />
    </div>
  );
}

export default TaskGroupPage;
