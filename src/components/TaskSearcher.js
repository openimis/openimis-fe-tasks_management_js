import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Searcher,
  useHistory,
  historyPush,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  RIGHT_TASKS_MANAGEMENT_SEARCH, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS, TASK_STATUS,
} from '../constants';
import TaskFilter from './TaskFilter';
import { fetchTasks } from '../actions';
import trimBusinessEvent from '../utils/trimBusinessEvent';

function TaskSearcher({
  rights, contribution,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);

  const fetchingTasks = useSelector((state) => state?.tasksManagement?.fetchingTasks);
  const fetchedTasks = useSelector((state) => state?.tasksManagement?.fetchedTasks);
  const errorTasks = useSelector((state) => state?.tasksManagement?.errorTasks);
  const tasks = useSelector((state) => state?.tasksManagement?.tasks);
  const tasksPageInfo = useSelector((state) => state?.tasksManagement?.tasksPageInfo);

  const openTask = (task, newTab = false) => historyPush(
    modulesManager,
    history,
    'tasksManagement.route.task',
    [task?.id],
    newTab,
  );

  const onDoubleClick = (task) => openTask(task);
  const fetch = (params) => dispatch(fetchTasks(modulesManager, params));

  const rowIdentifier = (task) => task.id;

  const isRowDisabled = (_, task) => task.status !== TASK_STATUS.ACCEPTED;

  const filterTasks = (tasks) => tasks.filter((task) => contribution.taskSource.includes(task.source));

  const headers = () => {
    const headers = [
      'task.source',
      'task.type',
      'task.entity',
      'task.assignee',
      'task.businessStatus',
      'task.status',
    ];
    if (rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH)) {
      headers.push('emptyLabel');
    }
    return headers;
  };

  const sorts = () => [
    ['source', true],
    ['type', true],
    ['entity', true],
    ['assignee', true],
    ['businessStatus', true],
    ['status', true],
  ];

  const itemFormatters = () => [
    (task) => task.source,
    (task) => trimBusinessEvent(task.businessEvent),
    (task) => task.entityString,
    (task) => task?.taskGroup?.code,
    (task) => task.businessStatus,
    (task) => task.status,
    (task) => (
      <Tooltip title={formatMessage('viewDetailsButton.tooltip')}>
        <IconButton
          onClick={() => openTask(task)}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'isDeleted: false',
    },
  });

  const taskFilter = (props) => (
    <TaskFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  return (
    <Searcher
      module="tasksManagement"
      FilterPane={taskFilter}
      fetch={fetch}
      items={filterTasks(tasks)}
      itemsPageInfo={tasksPageInfo}
      fetchingItems={fetchingTasks}
      fetchedItems={fetchedTasks}
      errorItems={errorTasks}
      tableTitle={formatMessageWithValues('task.searcherResultsTitle', {
        tasksTotalCount: filterTasks(tasks).length,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="source"
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      defaultFilters={defaultFilters()}
      rowDisabled={isRowDisabled}
      rights={rights}
    />
  );
}

export default TaskSearcher;
