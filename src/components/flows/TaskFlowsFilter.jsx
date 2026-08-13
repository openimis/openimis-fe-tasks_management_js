import React from 'react';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import _debounce from 'lodash/debounce';
import { TextInput } from '@openimis/fe-core';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING,
} from '../../constants';

const StyledForm = styled('div')(() => ({
  padding: '0 0 10px 0',
  width: '100%',
}));

const StyledItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

function TaskFlowsFilter({
  filters,
  onChangeFilters,
  formatMessage,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    debouncedOnChangeFilters([
      {
        id: filterName,
        value,
        filter: lookup ? `${filterName}_${lookup}: "${value}"` : `${filterName}: "${value}"`,
      },
    ]);
  };

  return (
    <Grid container component={StyledForm}>
      <Grid size={3} component={StyledItem}>
        <TextInput
          module="tasksManagement"
          label={formatMessage('taskFlow.code')}
          value={filterTextFieldValue('code')}
          onChange={onChangeStringFilter('code', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <TextInput
          module="tasksManagement"
          label={formatMessage('taskFlow.name')}
          value={filterTextFieldValue('name')}
          onChange={onChangeStringFilter('name', CONTAINS_LOOKUP)}
        />
      </Grid>
    </Grid>
  );
}

export default TaskFlowsFilter;
