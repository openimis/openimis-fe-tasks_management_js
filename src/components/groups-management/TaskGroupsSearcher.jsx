import React, { useEffect, useRef, useState } from 'react';
import {
  coreConfirm,
  journalize,
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  GetIconComponent,
} from '@openimis/fe-core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
const VisibilityIcon = GetIconComponent("Visibility");
const DeleteIcon = GetIconComponent("Delete");
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
  journalize,
  submittingMutation,
  mutation,
  deleteTaskGroup,
  fetchTaskGroups,
  fetchedTaskGroups,
  fetchingTaskGroups,
  errorTaskGroups,
  taskGroups,
  taskGroupsPageInfo,
  taskGroupsTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);

  const [deletedTaskGroupsUuids, setDeletedTaskGroupsUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

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

  // The delete travels with its own dialog; acting on the shared
  // state.core.confirmed deleted the row on any other dialog's "Yes" (OP-3214).
  const onDelete = (taskGroup) => coreConfirm(
    formatMessageWithValues('taskGroup.delete.confirm.title', {
      code: taskGroup.code,
    }),
    formatMessage('taskGroup.delete.confirm.message'),
    {
      onConfirm: () => {
        deleteTaskGroup(
          taskGroup,
          formatMessageWithValues('taskGroup.delete.mutationLabel', {
            id: taskGroup.id,
          }),
        );
        setDeletedTaskGroupsUuids((uuids) => [...uuids, taskGroup.id]);
      },
    },
  );

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
      fetchedItems={fetchedTaskGroups}
      fetchingItems={fetchingTaskGroups}
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
  fetchedTaskGroups: state.tasksManagement.fetchedTaskGroups,
  errorTaskGroups: state.tasksManagement.errorTaskGroups,
  taskGroups: state.tasksManagement.taskGroups,
  taskGroupsPageInfo: state.tasksManagement.taskGroupsPageInfo,
  taskGroupsTotalCount: state.tasksManagement.taskGroupsTotalCount,
  submittingMutation: state.tasksManagement.submittingMutation,
  mutation: state.tasksManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTaskGroups,
    deleteTaskGroup,
    coreConfirm,
    journalize,
  },
  dispatch,
);

export { TaskGroupsSearcher };
export default connect(mapStateToProps, mapDispatchToProps)(TaskGroupsSearcher);
