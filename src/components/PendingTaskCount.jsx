import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Chip } from '@mui/material';
import {
  useGraphqlQuery,
  useTranslations,
  useModulesManager,
  useHistory,
  historyPush,
} from '@openimis/fe-core';
import { RIGHT_TASKS_MANAGEMENT_SEARCH, TASKS_ALL_ROUTE } from '../constants';

const PENDING_TASK_COUNT_QUERY = `
  query PendingTaskCount($entityType: String!, $entityId: String!) {
    pendingTaskCount(entityType: $entityType, entityId: $entityId)
  }
`;

/**
 * How many tasks are pending on an entity, i.e. how many would make the backend refuse
 * an update of it. The backend answers for anyone who may read the entity, whatever
 * their task rights; only users who may search tasks can open the list.
 *
 * entityType: "app_label.model", e.g. "individual.individual".
 * onResult: optional, receives { key, blocking, count, loading } on every answer, so a
 * page may keep its Save disabled while a task is pending or while still loading.
 */
function PendingTaskCount({ entityType, entityId, onResult }) {
  const modulesManager = useModulesManager();
  const history = useHistory();
  const { formatMessageWithValues } = useTranslations('tasksManagement', modulesManager);
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);

  const { isLoading, data } = useGraphqlQuery(
    PENDING_TASK_COUNT_QUERY,
    { entityType, entityId },
    { skip: !entityType || !entityId },
  );
  const count = data?.pendingTaskCount ?? null;
  // Held in a ref: callers usually pass an inline function, which would otherwise
  // report again on every render of the page.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (onResultRef.current) {
      onResultRef.current({
        key: 'pendingTask', blocking: count > 0, count, loading: isLoading,
      });
    }
  }, [count, isLoading]);

  if (!count) return null;

  const canOpenList = rights.includes(RIGHT_TASKS_MANAGEMENT_SEARCH);
  const openList = () => historyPush(
    modulesManager,
    history,
    TASKS_ALL_ROUTE,
    [],
    false,
    `?entityIds=${encodeURIComponent(entityId)}`,
  );

  return (
    <Chip
      size="small"
      color="warning"
      label={formatMessageWithValues('pendingTaskCount.label', { count })}
      onClick={canOpenList ? openList : undefined}
    />
  );
}

export default PendingTaskCount;
