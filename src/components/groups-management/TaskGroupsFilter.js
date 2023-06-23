import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import _debounce from 'lodash/debounce';
import { TextInput, NumberInput } from '@openimis/fe-core';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING,
} from '../../constants';

const useStyles = makeStyles((theme) => ({
  form: {
    padding: '0 0 10px 0',
    width: '100%',
  },
  item: {
    padding: theme.spacing(1),
  },
}));

function TaskGroupsFilter({
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

  console.log(filters);

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label={formatMessage('taskGroup.code')}
          value={filterTextFieldValue('source')}
          onChange={onChangeStringFilter('source', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="tasksManagement"
          label={formatMessage('taskGroup.description')}
          value={filterTextFieldValue('description')}
          onChange={onChangeStringFilter('type', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <NumberInput
          module="tasksManagement"
          label={formatMessage('taskGroup.numberOfMembers')}
          value={filterValue('numberOfMembers')}
          onChange={onChangeStringFilter('numberOfMembers')}
        />
      </Grid>
    </Grid>
  );
}

export default TaskGroupsFilter;
