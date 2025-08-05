import React from 'react';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import _debounce from 'lodash/debounce';
import { TextInput } from '@openimis/fe-core';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING,
} from '../../constants';
import GroupPolicyPicker from '../../pickers/GroupPolicyPicker';

const StyledForm = styled('div')(({ theme }) => ({
  padding: '0 0 10px 0',
  width: '100%',
}));

const StyledItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

function TaskGroupsFilter({
  filters,
  onChangeFilters,
  formatMessage,
}) {
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
    <Grid container component={StyledForm}>
      <Grid item xs={3} component={StyledItem}>
        <TextInput
          module="tasksManagement"
          label={formatMessage('taskGroup.code')}
          value={filterTextFieldValue('code')}
          onChange={onChangeStringFilter('code', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} component={StyledItem}>
        <GroupPolicyPicker
          label="taskGroup.completionPolicy"
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
