import { sendGa4Event } from './googleAnalytics';

export const PLANNING_MODES = ['learn', 'plan', 'brief', 'debrief'] as const;
export type PlanningMode = (typeof PLANNING_MODES)[number];

export function parsePlanningMode(raw: string | null | undefined): PlanningMode {
  if (raw && (PLANNING_MODES as readonly string[]).includes(raw)) {
    return raw as PlanningMode;
  }
  return 'plan';
}

export function trackPlanningModeView(mode: PlanningMode): void {
  sendGa4Event('planning_mode_view', { mode });
}

export function trackPlanningNavlogReady(): void {
  sendGa4Event('planning_navlog_ready', {});
}
