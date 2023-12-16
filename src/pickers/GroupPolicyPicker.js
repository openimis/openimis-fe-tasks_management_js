import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { GROUP_RESOLVE_POLICY_LIST } from '../constants';

function GroupPolicyPicker(props) {
  const {
    required, withNull, readOnly, onChange, value, nullLabel, withLabel,
  } = props;
  return (
    <ConstantBasedPicker
      module="tasksManagement"
      label="taskGroup.completionPolicy"
      constants={GROUP_RESOLVE_POLICY_LIST}
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

export default GroupPolicyPicker;
