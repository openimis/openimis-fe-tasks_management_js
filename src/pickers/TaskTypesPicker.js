import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { TASK_AVAILABLE_TYPES } from '../constants';

function TaskTypesPicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="tasksManagement"
      label="task.type"
      constants={TASK_AVAILABLE_TYPES}
      onChange={onChange}
      value={value}
      required={required}
      readOnly={readOnly}
      withNull={withNull}
      nullLabel={nullLabel}
      withLabel={withLabel}
    />
  );
}

export default TaskTypesPicker;
