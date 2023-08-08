import React, { useState } from 'react';
import {
  PublishedComponent,
  historyPush,
  useModulesManager,
  useHistory,
} from '@openimis/fe-core';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Collapse,
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import { TASK_SEARCHER_CONTRIBUTION_KEY } from '../constants';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  title: {
    ...theme.paper.title,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

}));

function TasksManagementPage() {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  const contributions = modulesManager.getContribs(TASK_SEARCHER_CONTRIBUTION_KEY);

  const openTask = (task, newTab = false) => historyPush(
    modulesManager,
    history,
    'tasksManagement.route.task',
    [task?.id],
    newTab,
  );

  const onDoubleClick = (task) => openTask(task);

  const handleOpen = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    contributions && (
      contributions.map((contribution) => (
        <Box key={contribution.id}>
          <Paper className={classes.paper}>
            <div className={classes.titleContainer}>
              <Typography className={classes.title} button onClick={handleOpen}>
                {contribution.text}
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </Typography>
            </div>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <div className={classes.page}>
                <PublishedComponent
                  pubRef={contribution.pubRef}
                  rights={rights}
                  classes={classes}
                  openTask={openTask}
                  onDoubleClick={onDoubleClick}
                />
              </div>
            </Collapse>
          </Paper>
        </Box>
      ))
    )
  );
}

export default TasksManagementPage;
