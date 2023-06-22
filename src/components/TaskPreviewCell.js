import React from 'react';
import { HYPHEN } from '../constants';

function TaskPreviewCell({ formatterIndex, item, formatter }) {
  const showHistorical = (item) => {
    if (formatter(item.historic, formatterIndex) === formatter(item, formatterIndex)) {
      return HYPHEN;
    }

    return formatter(item.historic, formatterIndex);
  };
  return (
    <>
      <p>
        {formatter(item, formatterIndex)}
      </p>
      <p style={{ fontWeight: 'bold' }}>
        {showHistorical(item)}
      </p>
    </>
  );
}

export default TaskPreviewCell;
