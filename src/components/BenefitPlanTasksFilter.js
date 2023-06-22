import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import _debounce from 'lodash/debounce';
import { TextInput } from '@openimis/fe-core';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, TASK_STATUS_LIST,
} from '../constants';
import StatusPicker from '../pickers/StatusPicker';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: '0 0 10px 0',
    width: '100%',
  },
  item: {
    padding: theme.spacing(1),
  },
}));

function BenefitPlanTasksFilter({
  filters,
  onChangeFilters,
  formatMessage,
}) {
  const classes = useStyles();

  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterValue = (filterName) => filters?.[filterName]?.value;

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    if (lookup) {
      debouncedOnChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}_${lookup}: "${value}"`,
        },
      ]);
    } else {
      onChangeFilters([
        {
          id: filterName,
          value,
          filter: `${filterName}: "${value}"`,
        },
      ]);
    }
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label="benefitPlanTask.source"
          value={filterTextFieldValue('source')}
          onChange={onChangeStringFilter('source', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label="benefitPlanTask.type"
          value={filterTextFieldValue('type')}
          onChange={onChangeStringFilter('type', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label="benefitPlanTask.entity"
          value={filterTextFieldValue('entity')}
          onChange={onChangeStringFilter('entity', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label="benefitPlanTask.assignee"
          value={filterTextFieldValue('assignee')}
          onChange={onChangeStringFilter('assignee', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label="benefitPlanTask.businessStatus"
          value={filterTextFieldValue('businessStatus')}
          onChange={onChangeStringFilter('businessStatus', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <StatusPicker
          label="benefitPlanTask.status"
          constants={TASK_STATUS_LIST}
          withLabel
          nullLabel={formatMessage('defaultValue.any')}
          withNull
          value={filterValue('status')}
          onChange={(value) => onChangeFilters([
            {
              id: 'status',
              value,
              filter: `status: ${value}`,
            },
          ])}
        />
      </Grid>
    </Grid>
  );
}

export default BenefitPlanTasksFilter;
