import React, { useState } from 'react';
import {
  useTranslations, Autocomplete, useModulesManager, useGraphqlQuery,
} from '@openimis/fe-core';
import { EMPTY_STRING } from '../constants';

function TaskExecutorsPicker({
  multiple = true,
  groupId,
  withLabel,
  withPlaceholder,
  onChange,
  value,
  readOnly,
  required,
}) {
  const [searchString, setSearchString] = useState(EMPTY_STRING);
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query getTaskExecutors($taskGroupId: ID) {
      taskExecutor(taskGroup_Id: $taskGroupId) {
        edges {
          node {
            user {
              id
              username
              lastName
            }
          }
        }
      }
    }
  `,
    { taskGroupId: groupId || EMPTY_STRING },
  );

  const uniqueValues = [...new Map(value?.map((user) => [user.id, user])).values()];

  const executors = data?.taskExecutor?.edges.map((edge) => edge.node.user) ?? [];

  const filterOptions = (users) => users.filter((user, i, arr) => arr.findIndex((u) => u.id === user.id) === i);

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      isLoading={isLoading}
      error={error}
      label={formatMessage('TaskExecutorsPicker.label')}
      readOnly={readOnly}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      options={executors}
      value={uniqueValues}
      getOptionLabel={({ username, lastName }) => `${username} ${lastName}`}
      onChange={(executor) => onChange(executor)}
      filterOptions={filterOptions}
      filterSelectedOptions
      onInputChange={() => setSearchString(searchString)}
    />
  );
}

export default TaskExecutorsPicker;
