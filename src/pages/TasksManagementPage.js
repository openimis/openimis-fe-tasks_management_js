import React from 'react';
import { PublishedComponent } from '@openimis/fe-core';
import { useSelector } from 'react-redux';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { RIGHT_TASKS_MANAGEMENT_SEARCH } from '../constants';

const styles = (theme) => ({
  page: theme.page,
  paper: theme.paper.paper,
  title: theme.paper.title,
});

function TasksManagementPage() {
  const rights = useSelector((store) => store.core?.user?.i_user?.rights ?? []);

  return (
    rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH) && (
      <>
        <PublishedComponent
          pubRef="socialProtection.BenefitPlanTasksPage"
          module="tasks_management"
          rights={rights}
        />
        {/* REST OF PAGES */}
      </>
    )
  );
}

export default injectIntl(withTheme(withStyles(styles)(
  (TasksManagementPage),
)));
