import React from 'react';
import { connect } from 'react-redux';
import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import {
  IconButton,
  Tooltip,
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import {
  DEFAULT_PAGE_SIZE,
  ROWS_PER_PAGE_OPTIONS,
  BENEFIT_PLAN_TASKS_UPDATE,
  BENEFIT_PLAN_TASKS_SEARCH,
} from '../constants';
import BenefitPlanTasksFilter from './BenefitPlanTasksFilter';

const DUMMY_CONTENT = {
  tasks: [
    {
      id: 1,
      source: 'Email',
      type: 'Support',
      entity: 'Customer A',
      assignee: 'John Doe',
      businessStatus: 'Pending',
      status: 'RECEIVED',
    },
    {
      id: 2,
      source: 'Phone',
      type: 'Sales',
      entity: 'Lead B',
      assignee: 'Jane Smith',
      businessStatus: 'Pending',
      status: 'ACCEPTED',
    },
    {
      id: 3,
      source: 'Website',
      type: 'Support',
      entity: 'Customer C',
      assignee: 'John Doe',
      businessStatus: 'Completed',
      status: 'COMPLETED',
    },
    {
      id: 4,
      source: 'Email',
      type: 'Support',
      entity: 'Customer D',
      assignee: 'Sarah Johnson',
      businessStatus: 'Failed',
      status: 'FAILED',
    },
  ],
  tasksPageInfo: {
    totalCount: 4,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
    endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
  },
  tasksTotalCount: 4,
};

function BenefitPlanTasksSearcher({
  rights,
  fetchingTasks,
  errorTasks,
  // tasks,
  // tasksPageInfo,
  // tasksTotalCount,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(
    'tasksManagement',
    modulesManager,
  );

  const fetch = (params) => console.log(params);

  const openTask = (task) => history.push(
    `/${modulesManager.getRef('tasksManagement.route.task')}`
    + `/${task?.id}`,
  );

  const onDoubleClick = (task) => rights.includes(BENEFIT_PLAN_TASKS_UPDATE) && openTask(task);

  const headers = () => {
    const headers = [
      'benefitPlanTask.source',
      'benefitPlanTask.type',
      'benefitPlanTask.entity',
      'benefitPlanTask.assignee',
      'benefitPlanTask.businessStatus',
      'benefitPlanTask.status',
    ];
    if (rights.includes(BENEFIT_PLAN_TASKS_SEARCH)) {
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

  const itemFormatters = () => {
    const formatters = [
      (benefitPlanTask) => benefitPlanTask.source,
      (benefitPlanTask) => benefitPlanTask.type,
      (benefitPlanTask) => benefitPlanTask.entity,
      (benefitPlanTask) => benefitPlanTask.assignee,
      (benefitPlanTask) => benefitPlanTask.businessStatus,
      (benefitPlanTask) => benefitPlanTask.status,
    ];
    if (rights.includes(BENEFIT_PLAN_TASKS_SEARCH)) {
      formatters.push((benefitPlanTasks) => (
        <Tooltip title={formatMessage('benefitPlan.tooltip.viewDetails')}>
          <IconButton
            onClick={() => openTask(benefitPlanTasks)}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      ));
    }
    return formatters;
  };

  const benefitPlanTasksFilters = (props) => (
    <BenefitPlanTasksFilter
      formatMessage={formatMessage}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  // DUMMY_CONTENT UNTIL BE IS NOT READY
  return (
    <Searcher
      module="tasksManagement"
      FilterPane={benefitPlanTasksFilters}
      fetch={fetch}
      items={DUMMY_CONTENT.tasks}
      itemsPageInfo={DUMMY_CONTENT.tasksPageInfo}
      fetchedItems={fetchingTasks}
      errorItems={errorTasks}
      tableTitle={formatMessageWithValues('benefitPlan.tasks.searcherResultsTitle', {
        tasksTotalCount: DUMMY_CONTENT.tasksTotalCount,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="source"
    //   rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
    //   defaultFilters={defaultFilters()}
    //   rowDisabled={isRowDisabled}
    //   rowLocked={isRowDisabled}
      rights={rights}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingTasks: state.socialProtection.fetchingBenefitPlans,
  errorTasks: state.socialProtection.errorBenefitPlans,
  tasks: state.socialProtection.benefitPlans,
  tasksPageInfo: state.socialProtection.benefitPlansPageInfo,
  tasksTotalCount: state.socialProtection.benefitPlansTotalCount,
});

export default connect(mapStateToProps, null)(BenefitPlanTasksSearcher);
