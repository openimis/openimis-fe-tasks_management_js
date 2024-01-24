import React from 'react';
import { HYPHEN } from '../constants';

function TaskPreviewCell({
  formatterIndex, itemData, incomingData, formatter, jsonExt,
}) {
  const showHistorical = (itemIncomingData) => {
    if (formatter(itemData, jsonExt, formatterIndex) === formatter(itemIncomingData, jsonExt, formatterIndex)
        || !formatter(itemIncomingData, jsonExt, formatterIndex)) {
      return HYPHEN;
    }
    return formatter(itemIncomingData, jsonExt, formatterIndex);
  };

  return (
    <>
      {itemData && (
      <p>
        {formatter(itemData, jsonExt, formatterIndex) ?? HYPHEN}
      </p>
      )}
      {incomingData && (
      <p style={{ fontWeight: 'bold' }}>
        {showHistorical(incomingData)}
      </p>
      )}
    </>
  );
}

export default TaskPreviewCell;
