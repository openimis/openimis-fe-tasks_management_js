/* eslint-disable react/no-array-index-key */
import React from 'react';
import {
  TableContainer,
  TableHead,
  TableBody,
  Table,
  TableCell,
  TableRow,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import TaskPreviewCell from './TaskPreviewCell';

const useStyles = makeStyles((theme) => ({
  table: theme.table,
  tableTitle: theme.table.title,
  tableHeader: theme.table.header,
  tableRow: theme.table.row,
  tableLockedRow: theme.table.lockedRow,
  tableLockedCell: theme.table.lockedCell,
  tableHighlightedRow: theme.table.highlightedRow,
  tableHighlightedCell: theme.table.highlightedCell,
  tableHighlightedAltRow: theme.table.highlightedAltRow,
  tableHighlightedAltCell: theme.table.highlightedAltCell,
  tableDisabledRow: theme.table.disabledRow,
  tableDisabledCell: theme.table.disabledCell,
  tableFooter: theme.table.footer,
  pager: theme.table.pager,
  left: {
    textAlign: 'left',
  },
  right: {
    textAlign: 'right',
  },
  center: {
    textAlign: 'center',
  },
  clickable: {
    cursor: 'pointer',
  },
  loader: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.12)',
  },
}));

function TaskPreviewTable({ formatMessage, previewItems }) {
  const classes = useStyles();

  const TASK_COLUMNS = ['source', 'type', 'entity', 'assignee', 'businessStatus', 'status'];

  const itemFormatters = () => {
    const formatters = [
      (item) => item.source,
      (item) => item.type,
      (item) => item.entity,
      (item) => item.assignee,
      (item) => item.businessStatus,
      (item) => item.status,
    ];
    return formatters;
  };

  const TASK_PREVIEW_FORMATTERS = itemFormatters();

  return (
    <TableContainer>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            {TASK_COLUMNS.map((column) => (<TableCell>{formatMessage(`benefitPlanTask.${column}`)}</TableCell>))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* <ProgressOrError progress={fetchingTasks} error={errorTasks} /> */}
          {previewItems.map((item, itemIndex) => (
            <TableRow
              key={itemIndex}
              className={classes.tableRow}
            >
              {TASK_PREVIEW_FORMATTERS.map((formatter, formatterIndex) => (
                <TableCell
                  key={formatterIndex}
                >
                  <TaskPreviewCell formatter={formatter} formatterIndex={formatterIndex} item={item} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TaskPreviewTable;
