import React, { useEffect, useRef, useState } from 'react';
import {
  clearConfirm,
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
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  TASK_FLOW_UPDATE,
  TASK_FLOW_DELETE,
  TASKS_MANAGEMENT_ROUTE_FLOWS_FLOW,
} from '../../constants';
import TaskFlowsFilter from './TaskFlowsFilter';
import { fetchTaskFlows, deleteTaskFlow } from '../../actions';

const VisibilityIcon = GetIconComponent('Visibility');
const DeleteIcon = GetIconComponent('Delete');

function TaskFlowsSearcher({
  rights,
  coreConfirm,
  clearConfirm,
  confirmed,
  journalize,
  submittingMutation,
  mutation,
  deleteTaskFlow,
  fetchTaskFlows,
  fetchedTaskFlows,
  fetchingTaskFlows,
  errorTaskFlows,
  taskFlows,
  taskFlowsPageInfo,
  taskFlowsTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);

  const [taskFlowToDelete, setTaskFlowToDelete] = useState(null);
  const [deletedTaskFlowUuids, setDeletedTaskFlowUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeleteTaskFlowConfirmDialog = () => coreConfirm(
    formatMessageWithValues('taskFlow.delete.confirm.title', {
      code: taskFlowToDelete.code,
    }),
    formatMessage('taskFlow.delete.confirm.message'),
  );

  // Block body on purpose: a concise arrow would return `null` whenever there
  // is nothing to delete, and React then calls that value as the cleanup on
  // unmount ("destroy is not a function"), blanking the page on navigation.
  useEffect(() => {
    if (taskFlowToDelete) openDeleteTaskFlowConfirmDialog();
  }, [taskFlowToDelete]);

  useEffect(() => {
    if (taskFlowToDelete && confirmed) {
      deleteTaskFlow(
        taskFlowToDelete,
        formatMessageWithValues('taskFlow.delete.mutationLabel', {
          code: taskFlowToDelete?.code,
        }),
      );
      setDeletedTaskFlowUuids([...deletedTaskFlowUuids, taskFlowToDelete.id]);
    }
    if (taskFlowToDelete && confirmed !== null) {
      setTaskFlowToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      // A blocked delete (in-flight tasks) surfaces here through the
      // journalized mutation error.
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const fetch = (params) => fetchTaskFlows(modulesManager, params);

  const headers = () => {
    const headers = [
      'taskFlow.code',
      'taskFlow.name',
      'taskFlow.stepCount',
    ];
    if (rights.includes(TASK_FLOW_UPDATE)) {
      headers.push('emptyLabel');
    }
    return headers;
  };

  const openFlow = (flow) => history.push(
    `/${modulesManager.getRef(TASKS_MANAGEMENT_ROUTE_FLOWS_FLOW)}/${flow?.uuid}`,
  );

  const onDoubleClick = (flow) => rights.includes(TASK_FLOW_UPDATE) && openFlow(flow);

  const itemFormatters = () => {
    const formatters = [
      (flow) => flow.code,
      (flow) => flow.name,
      (flow) => flow.stepCount,
    ];
    if (rights.includes(TASK_FLOW_UPDATE)) {
      formatters.push((flow) => (
        <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
          <IconButton onClick={() => openFlow(flow)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    if (rights.includes(TASK_FLOW_DELETE)) {
      formatters.push((flow) => (
        <Tooltip title={formatMessage('deleteButton.tooltip')}>
          <IconButton onClick={() => setTaskFlowToDelete(flow)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const sorts = () => [
    ['code', true],
    ['name', true],
  ];

  const taskFlowFilter = ({ filters, onChangeFilters }) => (
    <TaskFlowsFilter filters={filters} onChangeFilters={onChangeFilters} formatMessage={formatMessage} />
  );

  const isRowDisabled = (_, flow) => deletedTaskFlowUuids.includes(flow.id);
  const rowIdentifier = (flow) => flow.id;

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
  });

  return (
    <Searcher
      module="tasksManagement"
      FilterPane={taskFlowFilter}
      fetch={fetch}
      items={taskFlows}
      itemsPageInfo={taskFlowsPageInfo}
      fetchedItems={fetchedTaskFlows}
      fetchingItems={fetchingTaskFlows}
      errorItems={errorTaskFlows}
      tableTitle={formatMessageWithValues('taskFlow.searcherResultsTitle', { taskFlowsTotalCount })}
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
  fetchingTaskFlows: state.tasksManagement.fetchingTaskFlows,
  fetchedTaskFlows: state.tasksManagement.fetchedTaskFlows,
  errorTaskFlows: state.tasksManagement.errorTaskFlows,
  taskFlows: state.tasksManagement.taskFlows,
  taskFlowsPageInfo: state.tasksManagement.taskFlowsPageInfo,
  taskFlowsTotalCount: state.tasksManagement.taskFlowsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.tasksManagement.submittingMutation,
  mutation: state.tasksManagement.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators(
  {
    fetchTaskFlows,
    deleteTaskFlow,
    coreConfirm,
    clearConfirm,
    journalize,
  },
  dispatch,
);

export default connect(mapStateToProps, mapDispatchToProps)(TaskFlowsSearcher);
