import React from 'react';
import { HYPHEN } from '../constants';

function TaskPreviewCell({
  formatterIndex, itemData, incomingData, formatter, jsonExt, setAdditionalData,
}) {
  const showHistorical = (itemIncomingData) => {
    if (formatter(itemData, jsonExt, formatterIndex, setAdditionalData)
        === formatter(itemIncomingData, jsonExt, formatterIndex, setAdditionalData)
        || !formatter(itemIncomingData, jsonExt, formatterIndex, setAdditionalData)) {
      return HYPHEN;
    }
    return formatter(itemIncomingData, jsonExt, formatterIndex, setAdditionalData);
  };

  const shouldDisplay = (value) => {
    if (!value) return false;
    return Object.keys(value).length !== 0;
  };

  return (
    <>
      {(shouldDisplay(itemData) || shouldDisplay(jsonExt)) && (
        <p>
          {formatter(itemData, jsonExt, formatterIndex, setAdditionalData) ?? HYPHEN}
        </p>
      )}
      {shouldDisplay(incomingData) && (
        <p style={{ fontWeight: 'bold' }}>
          {showHistorical(incomingData)}
        </p>
      )}
    </>
  );
}

export default TaskPreviewCell;
