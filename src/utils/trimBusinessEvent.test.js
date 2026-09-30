import { describe, expect, it } from 'vitest';

import trimBusinessEvent from './trimBusinessEvent';

describe('trimBusinessEvent', () => {
  it.each([
    ['drops the service prefix', 'BenefitPlanService.update', 'update'],
    ['keeps every segment after the prefix', 'payroll.accept.batch', 'accept.batch'],
    ['returns empty for an event with no dot', 'update', ''],
  ])('%s', (_label, event, expected) => {
    expect(trimBusinessEvent(event)).toBe(expected);
  });

  it.each([null, undefined, ''])('returns null for %o', (event) => {
    expect(trimBusinessEvent(event)).toBeNull();
  });
});
