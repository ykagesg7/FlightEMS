import type { FlightPlan } from '../../types/index';
import { fromPlanDocument, toPlanDocument } from '../../utils/planDocument';

export const FLIGHT_PLAN_DRAFT_STORAGE_KEY = 'flight-academy-plan-draft-v1';

export function loadFlightPlanDraft(): FlightPlan | null {
  try {
    const raw = localStorage.getItem(FLIGHT_PLAN_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return fromPlanDocument(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** @returns 書き込み成功時 true */
export function persistFlightPlanDraft(plan: FlightPlan): boolean {
  try {
    localStorage.setItem(FLIGHT_PLAN_DRAFT_STORAGE_KEY, JSON.stringify(toPlanDocument(plan)));
    return true;
  } catch {
    /* 容量・プライベートモード等 */
    return false;
  }
}

export function clearFlightPlanDraft(): void {
  try {
    localStorage.removeItem(FLIGHT_PLAN_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
