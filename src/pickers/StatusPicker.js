import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';

function StatusPicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel, label, constants,
  } = props;
  return (
    <ConstantBasedPicker
      module="tasksManagement"
      label={label}
      constants={constants}
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

export default StatusPicker;
