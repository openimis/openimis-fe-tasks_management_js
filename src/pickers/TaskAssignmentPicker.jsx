import React, { useState } from 'react';

import {
  useModulesManager,
  useTranslations,
  Autocomplete,
  useGraphqlQuery,
  decodeId,
} from '@openimis/fe-core';

export const ASSIGNMENT_KIND = { FLOW: 'FLOW', GROUP: 'GROUP' };

/**
 * Assigning a task is one decision with two shapes - an ordered approval
 * flow or a flat task group - so it reads as one field. The backend serves
 * both from taskAssignmentTargets already filtered to what it will accept,
 * so anything offered here can actually be saved.
 */
export const assignmentFromTask = (task) => {
  if (task?.assignment) return task.assignment;
  if (task?.flow) {
    return {
      kind: ASSIGNMENT_KIND.FLOW,
      uuid: task.flow.uuid ?? decodeId(task.flow.id),
      code: task.flow.code,
    };
  }
  if (task?.taskGroup) {
    return {
      kind: ASSIGNMENT_KIND.GROUP,
      uuid: task.taskGroup.uuid ?? decodeId(task.taskGroup.id),
      code: task.taskGroup.code,
      completionPolicy: task.taskGroup.completionPolicy,
    };
  }
  return null;
};

function TaskAssignmentPicker({
  onChange,
  readOnly,
  required,
  withLabel = true,
  withPlaceholder,
  value,
  label,
  placeholder,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const [searchString, setSearchString] = useState('');

  const { isLoading, data, error } = useGraphqlQuery(
    `
      query TaskAssignmentPicker ($search: String) {
          taskAssignmentTargets(search: $search, first: 20) {
              kind
              uuid
              code
              name
              stepCount
              completionPolicy
              threshold
              memberCount
            }
        }
        `,
    { search: searchString },
  );

  // Until fe-core forwards MUI's groupBy, the kind rides in the label so the
  // two families stay tellable apart in a flat list - and in the closed field.
  const optionLabel = (option) => {
    if (!option) return '';
    const kind = formatMessage(`taskAssignment.kind.${option.kind}`);
    // The selected value is rebuilt from the task, which carries no counts -
    // so the detail is shown only when the option actually came from the
    // query. Defaulting it would render a truthful-looking "0 steps".
    const detail = option.kind === ASSIGNMENT_KIND.FLOW
      ? option.stepCount != null
        && formatMessageWithValues('taskAssignment.flowDetail', { stepCount: option.stepCount })
      : option.completionPolicy;
    return detail ? `${kind} · ${option.code} — ${detail}` : `${kind} · ${option.code}`;
  };

  return (
    <Autocomplete
      required={required}
      placeholder={placeholder ?? formatMessage('taskAssignment.placeholder')}
      label={label ?? formatMessage('taskAssignment.label')}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.taskAssignmentTargets ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(option, selected) => option.kind === selected?.kind
        && option.uuid === selected?.uuid}
      onChange={(option) => onChange(option, option ? optionLabel(option) : null)}
      // The query already filtered server-side; re-filtering on the rendered
      // label would drop options matched on name.
      filterOptions={(options) => options}
      onInputChange={setSearchString}
    />
  );
}

export default TaskAssignmentPicker;
