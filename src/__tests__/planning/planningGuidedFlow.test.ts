import { describe, expect, it } from 'vitest';
import { resolvePlanningGuideStep } from '../../pages/planning/components/PlanningGuidedFlow';

describe('resolvePlanningGuideStep', () => {
  it('starts at airports when route is incomplete', () => {
    expect(resolvePlanningGuideStep(false, 0)).toBe(1);
  });

  it('moves to route confirm when airports are set', () => {
    expect(resolvePlanningGuideStep(true, 0)).toBe(2);
  });

  it('moves to NavLog when segments exist', () => {
    expect(resolvePlanningGuideStep(true, 2)).toBe(3);
  });
});
