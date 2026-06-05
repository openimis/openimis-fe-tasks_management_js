import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { TASK_AVAILABLE_SOURCES } from '../constants';

function TaskSourcesPicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="tasksManagement"
      label="task.source"
      constants={TASK_AVAILABLE_SOURCES}
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

export default TaskSourcesPicker;
