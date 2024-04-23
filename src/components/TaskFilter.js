import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import {
  TextInput, PublishedComponent, formatMessage, decodeId, toISODateTime,
} from '@openimis/fe-core';
import { defaultFilterStyles } from '../utils/styles';
import {
  CONTAINS_LOOKUP, DEFAULT_DEBOUNCE_TIME, EMPTY_STRING, MODULE_NAME,
} from '../constants';

function TaskFilter({
  intl, classes, filters, onChangeFilters,
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
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module={MODULE_NAME}
          label="task.source"
          value={filterTextFieldValue('source')}
          onChange={onChangeStringFilter('source', CONTAINS_LOOKUP)}
          readOnly
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module={MODULE_NAME}
          label="task.type"
          value={filterTextFieldValue('type')}
          onChange={onChangeStringFilter('businessEvent', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module={MODULE_NAME}
          label="task.entity"
          value={filterTextFieldValue('entity')}
          onChange={onChangeStringFilter('entityString', CONTAINS_LOOKUP)}
        />
      </Grid>
      <Grid item xs={3} className={classes.item}>
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
      <Grid item xs={3} className={classes.item}>
        <PublishedComponent
          pubRef="tasksManagement.taskStatusPicker"
          module={MODULE_NAME}
          withLabel
          nullLabel={formatMessage(intl, MODULE_NAME, 'any')}
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
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module={MODULE_NAME}
          label={formatMessage(intl, MODULE_NAME, 'task.dateCreated.after')}
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
      <Grid item xs={2} className={classes.item}>
        <PublishedComponent
          pubRef="core.DatePicker"
          module={MODULE_NAME}
          label={formatMessage(intl, MODULE_NAME, 'task.dateCreated.before')}
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

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(TaskFilter)));
