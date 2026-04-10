import React, { useState } from 'react';
import {
  useModulesManager,
  GetIconComponent,
} from '@openimis/fe-core';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Collapse,
} from '@mui/material';
const ExpandLess = GetIconComponent("ExpandLess");
const ExpandMore = GetIconComponent("ExpandMore");
import { styled } from '@mui/material/styles';
import { TASK_CONTRIBUTION_KEY } from '../constants';
import TaskSearcher from '../components/TaskSearcher';

const StyledPage = styled('div')(({ theme }) => ({
  ...theme.page ?? {},
}));

const StyledPaper = styled('div')(({ theme }) => ({
  ...theme.paper?.paper ?? {},
}));

const StyledTitle = styled('div')(({ theme }) => ({
  ...theme.paper?.title ?? {},
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

function TasksManagementPage() {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);
  const modulesManager = useModulesManager();

  const contributions = modulesManager.getContribs(TASK_CONTRIBUTION_KEY);

  const [expandedContributionId, setExpandedContributionId] = useState(null);

  const handleOpen = (contributionId) => {
    setExpandedContributionId(contributionId === expandedContributionId ? null : contributionId);
  };

  return (
    contributions && (
      contributions.map((contribution, index) => (
        <Box key={index}>
          <Paper component={StyledPaper}>
            <div>
              <Typography component={StyledTitle} button onClick={() => handleOpen(contribution.text)}>
                {contribution.text}
                {expandedContributionId === contribution.text ? <ExpandLess /> : <ExpandMore />}
              </Typography>
            </div>
            <Collapse in={expandedContributionId === contribution.text} timeout="auto" unmountOnExit>
              <StyledPage>
                <TaskSearcher
                  contribution={contribution}
                  rights={rights}
                />
              </StyledPage>
            </Collapse>
          </Paper>
        </Box>
      ))
    )
  );
}

export default TasksManagementPage;
