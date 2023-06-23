import React, { useState } from 'react';
import { useTranslations, Autocomplete, useModulesManager } from '@openimis/fe-core';
import { EMPTY_STRING } from '../constants';

function TaskExecutorsPicker({
  multiple = true,
  onChange,
  value,
  readOnly,
  required,
}) {
  const [searchString, setSearchString] = useState(EMPTY_STRING);
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('tasksManagement', modulesManager);

  const filterTaskExecutors = () => {};

  // TASK EXECUTOR IN ACTIVE TASK GROUP
  const options = [];

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      label={formatMessage('TaskExecutorsPicker.label')}
      readOnly={readOnly}
      options={options}
      value={value}
      getOptionLabel={(o) => o?.name}
      onChange={(option) => onChange(option, option?.name)}
      filterOptions={filterTaskExecutors}
      filterSelectedOptions
      onInputChange={() => setSearchString(searchString)}
    />
  );
}

export default TaskExecutorsPicker;
