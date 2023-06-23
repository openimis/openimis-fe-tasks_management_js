import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Form, Helmet, useTranslations, useModulesManager, useHistory,
} from '@openimis/fe-core';
import DeleteIcon from '@material-ui/icons/Delete';
import _ from 'lodash';
import TaskGroupHeadPanel from '../components/groups-management/TaskGroupHeadPanel';
import { EMPTY_STRING } from '../constants';
import { fetchTaskGroup, clearTaskGroup } from '../actions';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
}));

function TaskGroupPage({
  rights, taskGroup, taskGroupUuid, fetchTaskGroup,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [editedTaskGroup, setEditedTaskGroup] = useState({});
  // const [confirmedAction, setConfirmedAction] = useState(() => null);
  // const prevSubmittingMutationRef = useRef();
  const back = () => history.goBack();

  useEffect(() => {
    if (taskGroupUuid) {
      fetchTaskGroup(modulesManager, { taskGroupUuid });
    }
  }, [taskGroupUuid]);

  const mandatoryFieldsEmpty = () => !editedTaskGroup?.code && !editedTaskGroup?.completionPolicy;

  const doesTaskGroupChange = () => {
    if (_.isEqual(taskGroup, editedTaskGroup)) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty() && doesTaskGroupChange();

  const handleSave = () => {};

  const actions = [
    !!taskGroup && {
      doIt: () => {},
      icon: <DeleteIcon />,
      tooltip: formatMessage('deleteButton.tooltip'),
    },
  ];

  useEffect(() => setEditedTaskGroup(taskGroup), [taskGroup]);

  useEffect(() => () => clearTaskGroup(), []);

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
        mandatoryFieldsEmpty={mandatoryFieldsEmpty}
        canSave={canSave}
        save={handleSave}
        HeadPanel={TaskGroupHeadPanel}
        formatMessage={formatMessage}
        rights={rights}
        actions={actions}
        // setConfirmedAction={setConfirmedAction}
        // saveTooltip={formatMessage(intl, 'individual', `saveButton.tooltip.${canSave ? 'enabled' : 'disabled'}`)}
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
  // createBenefitPlan,
  fetchTaskGroup,
  clearTaskGroup,
  // deleteBenefitPlan,
  // updateBenefitPlan,
  // coreConfirm,
  // clearConfirm,
  // journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TaskGroupPage);
