import React from 'react';
import {
  useTranslations, Autocomplete, useModulesManager, useGraphqlQuery,
} from '@openimis/fe-core';

function TaskExecutorsPicker({
  multiple = true,
  withLabel,
  onChange,
  value,
  readOnly,
  required,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);

  const { isLoading, data, error } = useGraphqlQuery(
    `
    query TaskExecutorsPicker {
      users {
        edges {
          node {
            id
            username
            lastName
          }
        }
      }
    }
  `,
  );

  const executors = data?.users?.edges.map((edge) => edge.node) ?? [];

  const filterOptions = (users, { inputValue }) => {
    const filteredUsers = users?.filter((user) => {
      const username = user.username.toLowerCase();
      const lastName = user.lastName.toLowerCase();
      const input = inputValue.toLowerCase();

      return username.includes(input) || lastName.includes(input);
    });
    return filteredUsers.filter((user, i, arr) => arr.findIndex((u) => u.id === user.id) === i);
  };

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      isLoading={isLoading}
      error={error}
      label={formatMessage('TaskExecutorsPicker.label')}
      placeholder={formatMessage('TaskExecutorsPicker.placeholder')}
      readOnly={readOnly}
      withLabel={withLabel}
      withPlaceholder={!value?.length}
      options={executors}
      value={value}
      getOptionLabel={({ username, lastName }) => `${username} ${lastName}`}
      onChange={(executor) => onChange(executor)}
      filterOptions={filterOptions}
      filterSelectedOptions
      onInputChange={() => {}}
    />
  );
}

export default TaskExecutorsPicker;
