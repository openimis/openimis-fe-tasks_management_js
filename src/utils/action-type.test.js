import { describe, expect, it } from 'vitest';

import {
  CLEAR, ERROR, REQUEST, SUCCESS, VALID,
} from './action-type';

describe('action type suffixes', () => {
  it.each([
    ['REQUEST', REQUEST, 'TASK_MANAGEMENT_TASK_REQ'],
    ['SUCCESS', SUCCESS, 'TASK_MANAGEMENT_TASK_RESP'],
    ['ERROR', ERROR, 'TASK_MANAGEMENT_TASK_ERR'],
    ['CLEAR', CLEAR, 'TASK_MANAGEMENT_TASK_CLEAR'],
    ['VALID', VALID, 'TASK_MANAGEMENT_TASK_VALID'],
  ])('%s appends the suffix fe-core dispatches under', (_label, build, expected) => {
    expect(build('TASK_MANAGEMENT_TASK')).toBe(expected);
  });
});
