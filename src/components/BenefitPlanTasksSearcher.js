import React from 'react';
import { connect } from 'react-redux';
import {
  Searcher,
  //   useHistory,
  useModulesManager,
  useTranslations,
} from '@openimis/fe-core';
import {
  IconButton,
  Tooltip,
} from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { RIGHT_TASKS_MANAGEMENT_SEARCH, DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../constants';
import BenefitPlanTasksFilter from './BenefitPlanTasksFilter';

function BenefitPlanTasksSearcher({
  rights,
  fetchingTasks,
  errorTasks,
  tasks,
  tasksPageInfo,
  tasksTotalCount,
}) {
//   const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(
    'tasksManagement',
    modulesManager,
  );

  const fetch = (params) => console.log(params);

  const openTask = (task) => console.log(task);

  const headers = () => {
    const headers = [
      'benefitPlanTask.source',
      'benefitPlanTask.type',
      'benefitPlanTask.entity',
      'benefitPlanTask.assignee',
      'benefitPlanTask.businessStatus',
      'benefitPlanTask.status',
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

  const itemFormatters = () => {
    const formatters = [
      (benefitPlanTask) => benefitPlanTask.source,
      (benefitPlanTask) => benefitPlanTask.type,
      (benefitPlanTask) => benefitPlanTask.entity,
      (benefitPlanTask) => benefitPlanTask.assignee,
      (benefitPlanTask) => benefitPlanTask.businessStatus,
      (benefitPlanTask) => benefitPlanTask.status,
    ];
    if (rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH)) {
      formatters.push((benefitPlanTasks) => (
        <Tooltip title={formatMessage('benefitPlan.tooltip.viewDetails')}>
          <IconButton
            disabled
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

  return (
    <Searcher
      module="tasksManagement"
      FilterPane={benefitPlanTasksFilters}
      fetch={fetch}
      items={tasks}
      itemsPageInfo={tasksPageInfo}
      fetchedItems={fetchingTasks}
      errorItems={errorTasks}
      tableTitle={formatMessageWithValues('benefitPlan.tasks.searcherResultsTitle', {
        tasksTotalCount,
      })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
      defaultOrderBy="source"
    //   rowIdentifier={rowIdentifier}
    //   onDoubleClick={onDoubleClick}
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
