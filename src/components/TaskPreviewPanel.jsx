import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography } from '@mui/material';
import { useModulesManager } from '@openimis/fe-core';
import { EMPTY_STRING, TASK_CONTRIBUTION_KEY } from '../constants';
import TaskPreviewTable from './TaskPreviewTable';

const StyledPaper = styled('div')(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTitle = styled('div')(({ theme }) => ({
  ...theme.paper?.title ?? {},
}));

function TaskPreviewPanel({ rights, edited, setAdditionalData }) {
  const modulesManager = useModulesManager();
  const [header, setHeader] = useState(EMPTY_STRING);
  const [tableTaskHeaders, setTableTaskHeaders] = useState([]);
  const [taskItemFormatters, setTaskItemFormatters] = useState([]);
  const task = { ...edited };

  useEffect(() => {
    if (task.source) {
      const contrib = modulesManager.getContribs(TASK_CONTRIBUTION_KEY)
        .find((c) => c.taskSource.includes(task.source));

      if (contrib) {
        const { tableHeaders, itemFormatters, text } = contrib;
        setHeader(text);
        setTableTaskHeaders(tableHeaders);
        setTaskItemFormatters(itemFormatters);
      }
    }
  }, [task.source]);

  return (
    <Paper component={StyledPaper}>
      <Typography component={StyledTitle}>
        {header}
      </Typography>
      <TaskPreviewTable
        rights={rights}
        previewItem={task}
        tableHeaders={tableTaskHeaders}
        itemFormatters={taskItemFormatters}
        setAdditionalData={setAdditionalData}
      />
    </Paper>
  );
}

export default TaskPreviewPanel;
