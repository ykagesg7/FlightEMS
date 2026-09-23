import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendGa4Event = vi.fn();

vi.mock('../../lib/googleAnalytics', () => ({
  sendGa4Event: (...args: unknown[]) => sendGa4Event(...args),
}));

import {
  parsePlanningMode,
  trackPlanningModeView,
  trackPlanningNavlogReady,
} from '../../lib/planningAnalytics';

describe('planningAnalytics', () => {
  beforeEach(() => {
    sendGa4Event.mockClear();
  });

  it('parsePlanningMode defaults invalid values to plan', () => {
    expect(parsePlanningMode(null)).toBe('plan');
    expect(parsePlanningMode('invalid')).toBe('plan');
    expect(parsePlanningMode('learn')).toBe('learn');
  });

  it('trackPlanningModeView sends planning_mode_view', () => {
    trackPlanningModeView('brief');

    expect(sendGa4Event).toHaveBeenCalledWith('planning_mode_view', { mode: 'brief' });
  });

  it('trackPlanningNavlogReady sends planning_navlog_ready', () => {
    trackPlanningNavlogReady();

    expect(sendGa4Event).toHaveBeenCalledWith('planning_navlog_ready', {});
  });
});
