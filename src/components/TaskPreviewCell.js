import React from 'react';
import { HYPHEN } from '../constants';

function TaskPreviewCell({
  formatterIndex, itemData, incomingData, formatter,
}) {
  const showHistorical = (itemIncomingData) => {
    if (formatter(itemData, formatterIndex) === formatter(itemIncomingData, formatterIndex)
        || !formatter(itemIncomingData, formatterIndex)) {
      return HYPHEN;
    }
    return formatter(itemIncomingData, formatterIndex);
  };

  return (
    <>
      <p>
        {formatter(itemData, formatterIndex)}
      </p>
      <p style={{ fontWeight: 'bold' }}>
        {showHistorical(incomingData)}
      </p>
    </>
  );
}

export default TaskPreviewCell;
