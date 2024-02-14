import React from 'react';
import {
  Autocomplete, useTranslations, useModulesManager,
} from '@openimis/fe-core';
import { TASK_CONTRIBUTION_KEY } from '../constants';

function TaskSourcePicker({
  onChange,
  readOnly,
  required,
  withLabel,
  value,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('tasksManagement');
  const contributions = modulesManager.getContribs(TASK_CONTRIBUTION_KEY);
  const sources = contributions.flatMap((contribution) => {
    const source = contribution.taskSource;
    return source ? [{ id: source, name: source }] : [];
  });

  return (
    <Autocomplete
      multiple
      required={required}
      label={formatMessage('TaskSourcePicker.label')}
      placeholder={formatMessage('TaskSourcePicker.placeholder')}
      readOnly={readOnly}
      withLabel={withLabel}
      withPlaceholder={!value?.length}
      options={sources}
      value={value}
      getOptionLabel={(source) => `${source.name}`}
      onChange={onChange}
      filterSelectedOptions
      onInputChange={() => {}}
    />
  );
}

export default TaskSourcePicker;
