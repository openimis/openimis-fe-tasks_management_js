/* eslint-disable react/no-array-index-key */
import React from 'react';

import { injectIntl } from 'react-intl';
import { withStyles, withTheme } from '@material-ui/core/styles';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@material-ui/core';
import { formatMessage, ProgressOrError } from '@openimis/fe-core';
import { useSelector } from 'react-redux';
import TaskPreviewCell from './TaskPreviewCell';

const styles = (theme) => ({
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
});

function BenefitPlanTaskPreviewTable({
  intl,
  classes,
  previewItem,
  itemFormatters,
  tableHeaders,
}) {
  const { fetchingBenefitPlanTasks, errorBenefitPlanTasks } = useSelector((state) => state?.socialProtection);

  return (
    <TableContainer>
      <Table size="small" className={classes.table}>
        <TableHead>
          <TableRow>
            {tableHeaders.map((column) => (
              <TableCell>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <ProgressOrError
            className={classes.center}
            progress={fetchingBenefitPlanTasks}
            error={errorBenefitPlanTasks}
          />
          <TableRow
            className={classes.tableRow}
          >
            {itemFormatters.map((formatter, formatterIndex) => (
              <TableCell
                key={formatterIndex}
              >
                <TaskPreviewCell
                  formatter={formatter}
                  formatterIndex={formatterIndex}
                  itemData={previewItem.currentEntityData}
                  incomingData={previewItem.data}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default injectIntl(withTheme(withStyles(styles)(BenefitPlanTaskPreviewTable)));
