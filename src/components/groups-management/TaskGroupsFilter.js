import React from 'react';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import _debounce from 'lodash/debounce';
import { TextInput } from '@openimis/fe-core';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, GROUP_RESOLVE_POLICY_LIST,
} from '../../constants';
import StatusPicker from '../../pickers/StatusPicker';

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
      debouncedOnChangeFilters([
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
          label={formatMessage('taskGroup.code')}
          value={filterTextFieldValue('code')}
          onChange={onChangeStringFilter('code', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <StatusPicker
          label="taskGroup.completionPolicy"
          constants={GROUP_RESOLVE_POLICY_LIST}
          withLabel
          nullLabel={formatMessage('defaultValue.any')}
          withNull
          value={filterValue('completionPolicy')}
          onChange={(value) => onChangeFilters([
            {
              id: 'completionPolicy',
              value,
              filter: `completionPolicy: ${value}`,
            },
          ])}
        />
      </Grid>
    </Grid>
  );
}

export default TaskGroupsFilter;
