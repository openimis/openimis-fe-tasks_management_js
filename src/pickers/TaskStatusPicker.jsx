import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { TASK_STATUS_LIST } from '../constants';

function TaskStatusPicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="tasksManagement"
      label="task.status"
      constants={TASK_STATUS_LIST}
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

export default TaskStatusPicker;
