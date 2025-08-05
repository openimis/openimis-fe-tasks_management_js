/* eslint-disable react/no-array-index-key */
import React from 'react';

import { injectIntl } from 'react-intl';
import { styled } from '@mui/material/styles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ProgressOrError } from '@openimis/fe-core';
import { useSelector } from 'react-redux';
import TaskPreviewCell from './TaskPreviewCell';

const StyledTable = styled('div')(({ theme }) => ({
  ...theme.table,
}));

const StyledTableTitle = styled('div')(({ theme }) => ({
  ...theme.table.title,
}));

const StyledTableHeader = styled('div')(({ theme }) => ({
  ...theme.table.header,
}));

const StyledTableRow = styled('div')(({ theme }) => ({
  ...theme.table.row,
}));

const StyledTableLockedRow = styled('div')(({ theme }) => ({
  ...theme.table.lockedRow,
}));

const StyledTableLockedCell = styled('div')(({ theme }) => ({
  ...theme.table.lockedCell,
}));

const StyledTableHighlightedRow = styled('div')(({ theme }) => ({
  ...theme.table.highlightedRow,
}));

const StyledTableHighlightedCell = styled('div')(({ theme }) => ({
  ...theme.table.highlightedCell,
}));

const StyledTableHighlightedAltRow = styled('div')(({ theme }) => ({
  ...theme.table.highlightedAltRow,
}));

const StyledTableHighlightedAltCell = styled('div')(({ theme }) => ({
  ...theme.table.highlightedAltCell,
}));

const StyledTableDisabledRow = styled('div')(({ theme }) => ({
  ...theme.table.disabledRow,
}));

const StyledTableDisabledCell = styled('div')(({ theme }) => ({
  ...theme.table.disabledCell,
}));

const StyledTableFooter = styled('div')(({ theme }) => ({
  ...theme.table.footer,
}));

const StyledPager = styled('div')(({ theme }) => ({
  ...theme.table.pager,
}));

const StyledLeft = styled('div')(({ theme }) => ({
  textAlign: 'left',
}));

const StyledRight = styled('div')(({ theme }) => ({
  textAlign: 'right',
}));

const StyledCenter = styled('div')(({ theme }) => ({
  textAlign: 'center',
}));

const StyledClickable = styled('div')(({ theme }) => ({
  cursor: 'pointer',
}));

const StyledLoader = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0, 0, 0, 0.12)',
}));

function TaskPreviewTable({
  previewItem,
  itemFormatters,
  tableHeaders,
  setAdditionalData,
}) {
  const { fetchingTasks, errorTasks } = useSelector((state) => state?.tasksManagement);

  return previewItem && (
    <TableContainer>
      <Table size="small" component={StyledTable}>
        <TableHead>
          <TableRow>
            {tableHeaders.map((column) => (
              <TableCell>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <ProgressOrError
            className={StyledCenter}
            progress={fetchingTasks}
            error={errorTasks}
          />
          <TableRow>
            {itemFormatters.map((formatter, formatterIndex) => (
              <TableCell
                key={formatterIndex}
              >
                <TaskPreviewCell
                  formatter={formatter}
                  formatterIndex={formatterIndex}
                  jsonExt={!previewItem?.jsonExt || JSON.parse(previewItem.jsonExt)}
                  itemData={previewItem.businessData?.current_data}
                  incomingData={previewItem.businessData?.incoming_data || previewItem.businessData}
                  setAdditionalData={setAdditionalData}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default injectIntl(TaskPreviewTable);
