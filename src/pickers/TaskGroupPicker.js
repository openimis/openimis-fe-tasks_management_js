import React, { useState } from 'react';

import {
  useModulesManager,
  useTranslations,
  Autocomplete,
  useGraphqlQuery,
} from '@openimis/fe-core';

function TaskGroupPicker(props) {
  const {
    onChange,
    readOnly,
    required,
    withLabel = true,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    multiple,
  } = props;

  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('claim', modulesManager);
  const [searchString, setSearchString] = useState('');

  const { isLoading, data, error } = useGraphqlQuery(
    `
      query TaskGroupPicker ($search: String) {
          taskGroup(search: $search, first: 20) {
              edges {
                  node {
                      id
                      code
                      completionPolicy
                    }
                }
            }
        }
        `,
    {
      search: searchString,
    },
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage('tasksManagement.taskGroup.placeholder')}
      label={label ?? formatMessage('tasksManagement.benefitPlanTask.assignee')}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.taskGroup?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.code}`}
      onChange={(option) => onChange(option, option ? `${option.code}` : null)}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
}

export default TaskGroupPicker;
