import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import _debounce from 'lodash/debounce';
import {
  TextInput, PublishedComponent, formatMessage, decodeId, toISODateTime,
} from '@openimis/fe-core';
import { defaultFilterStyles } from '../utils/styles';

import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, MODULE_NAME,
} from '../constants';

const StyledForm = styled('div')(({ theme }) => ({
  padding: '0 0 10px 0',
  width: '100%',
}));

const StyledItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(1),
}));

function TaskAllFilter({
  intl, filters, onChangeFilters,
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
    <Grid container component={StyledForm}>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="tasksManagement.taskSourcesPicker"
          module={MODULE_NAME}
          withLabel
          nullLabel="defaultValue.any"
          withNull
          value={filterValue('source')}
          onChange={(value) => onChangeFilters([
            {
              id: 'source',
              value,
              filter: value ? `source: "${value}"` : EMPTY_STRING,
            },
          ])}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="tasksManagement.taskTypesPicker"
          module={MODULE_NAME}
          withLabel
          nullLabel="defaultValue.any"
          withNull
          value={filterValue('businessEvent')}
          onChange={onChangeStringFilter('businessEvent', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <TextInput
          module={MODULE_NAME}
          label="task.entity"
          value={filterTextFieldValue('entityString')}
          onChange={onChangeStringFilter('entityString', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="tasksManagement.taskGroupPicker"
          module={MODULE_NAME}
          value={filterValue('taskGroupId')}
          onChange={(value) => onChangeFilters([
            {
              id: 'taskGroupId',
              value,
              filter: value?.id ? `taskGroupId: "${decodeId(value.id)}"` : '',
            },
          ])}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="tasksManagement.taskStatusPicker"
          module={MODULE_NAME}
          withLabel
          nullLabel="defaultValue.any"
          withNull
          value={filterValue('status')}
          onChange={(value) => onChangeFilters([
            {
              id: 'status',
              value,
              filter: value ? `status: ${value}` : EMPTY_STRING,
            },
          ])}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module={MODULE_NAME}
          label="task.dateCreated.after"
          value={filterValue('dateCreated_Gte')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dateCreated_Gte',
              value: v,
              filter: `dateCreated_Gte: "${toISODateTime(v)}"`,
            },
          ])}
        />
      </Grid>
      <Grid size={3} component={StyledItem}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module={MODULE_NAME}
          label="task.dateCreated.before"
          value={filterValue('dateCreated_Lte')}
          onChange={(v) => onChangeFilters([
            {
              id: 'dateCreated_Lte',
              value: v,
              filter: `dateCreated_Lte: "${toISODateTime(v)}"`,
            },
          ])}
        />
      </Grid>
    </Grid>
  );
}

export { StyledForm };
export default injectIntl(TaskAllFilter);
