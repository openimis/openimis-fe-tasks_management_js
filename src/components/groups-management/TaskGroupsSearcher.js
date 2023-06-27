import React, { useEffect, useRef, useState } from 'react';
import {
  clearConfirm,
  coreConfirm,
  journalize,
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  DEFAULT_PAGE_SIZE,
  TASK_GROUP_UPDATE,
  TASK_GROUP_DELETE,
  ROWS_PER_PAGE_OPTIONS,
  TASKS_MANAGEMENT_ROUTE_GROUPS_GROUP,
} from '../../constants';
import TaskGroupsFilter from './TaskGroupsFilter';
import { fetchTaskGroups, deleteTaskGroup } from '../../actions';

function TaskGroupsSearcher({
  rights,
  coreConfirm,
  clearConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  deleteTaskGroup,
  fetchTaskGroups,
  fetchingTaskGroups,
  errorTaskGroups,
  taskGroups,
  taskGroupsPageInfo,
  taskGroupsTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);

  const [taskGroupToDelete, setTaskGroupToDelete] = useState(null);
  const [deletedTaskGroupsUuids, setDeletedTaskGroupsUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeleteTaskGroupConfirmDialog = () => coreConfirm(
    formatMessageWithValues('taskGroup.delete.confirm.title', {
      code: taskGroupToDelete.code,
    }),
    formatMessage('taskGroup.delete.confirm.message'),
  );

  useEffect(() => taskGroupToDelete && openDeleteTaskGroupConfirmDialog(), [taskGroupToDelete]);

  useEffect(() => {
    if (taskGroupToDelete && confirmed) {
      deleteTaskGroup(
        taskGroupToDelete,
        formatMessageWithValues('taskGroup.delete.mutationLabel', {
          code: taskGroupToDelete.code,
        }),
      );
      setDeletedTaskGroupsUuids([...deletedTaskGroupsUuids, taskGroupToDelete.id]);
    }
    if (taskGroupToDelete && confirmed !== null) {
      setTaskGroupToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const fetch = (params) => fetchTaskGroups(modulesManager, params);

  const headers = () => {
    const headers = [
      'taskGroup.code',
      'taskGroup.completionPolicy',
    ];
    if (rights.includes(TASK_GROUP_UPDATE)) {
      headers.push('emptyLabel');
    }
    return headers;
  };

  const openGroup = (taskGroup) => history.push(
    `/${modulesManager.getRef(TASKS_MANAGEMENT_ROUTE_GROUPS_GROUP)}/${taskGroup?.uuid}`,
  );

  const onDoubleClick = (taskGroup) => rights.includes(TASK_GROUP_UPDATE) && openGroup(taskGroup);

  const onDelete = (taskGroup) => setTaskGroupToDelete(taskGroup);

  const itemFormatters = () => {
    const formatters = [
      (taskGroup) => taskGroup.code,
      (taskGroup) => taskGroup.completionPolicy,
    ];
    if (rights.includes(TASK_GROUP_UPDATE)) {
      formatters.push((taskGroup) => (
        <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
          <IconButton
            onClick={() => openGroup(taskGroup)}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(TASK_GROUP_DELETE)) {
      formatters.push((taskGroup) => (
        <Tooltip title={formatMessage('deleteButton.tooltip')}>
          <IconButton
            onClick={() => onDelete(taskGroup)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const sorts = () => [
    ['code', true],
    ['completionPolicy', true],
  ];

  const taskGroupFilter = ({ filters, onChangeFilters }) => (
    <TaskGroupsFilter filters={filters} onChangeFilters={onChangeFilters} formatMessage={formatMessage} />
  );

  const isRowDisabled = (_, taskGroup) => deletedTaskGroupsUuids.includes(taskGroup.id);
  const rowIdentifier = (taskGroup) => taskGroup.id;

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
  });

  return (
    <Searcher
      module="tasksManagement"
      FilterPane={taskGroupFilter}
      fetch={fetch}
      items={taskGroups}
      itemsPageInfo={taskGroupsPageInfo}
      fetchedItems={fetchingTaskGroups}
      errorItems={errorTaskGroups}
      tableTitle={formatMessageWithValues('taskGroup.searcherResultsTitle', { taskGroupsTotalCount })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="code"
      defaultFilters={defaultFilters()}
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingTaskGroups: state.tasksManagement.fetchingTaskGroups,
  errorTaskGroups: state.tasksManagement.errorTaskGroups,
  taskGroups: state.tasksManagement.taskGroups,
  taskGroupsPageInfo: state.tasksManagement.taskGroupsPageInfo,
  taskGroupsTotalCount: state.tasksManagement.taskGroupsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.tasksManagement.submittingMutation,
  mutation: state.tasksManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTaskGroups,
    deleteTaskGroup,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TaskGroupsSearcher);
