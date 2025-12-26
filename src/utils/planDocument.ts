import { FlightPlan, PlanDocumentV1 } from '../types';

const SCHEMA_VERSION = 1;

const defaultUnits: PlanDocumentV1['units'] = {
  fuel: 'lb',
  fuelFlow: 'lb/hr',
  remainingDisplay: 'klb',
};

// FlightPlan → PlanDocumentV1
export const toPlanDocument = (plan: FlightPlan): PlanDocumentV1 => {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
    units: defaultUnits,
    planInput: plan,
    derived: {},
  };
};

// PlanDocumentV1 → FlightPlan（安全なフォールバック付き）
export const fromPlanDocument = (doc: unknown): FlightPlan | null => {
  if (!doc || typeof doc !== 'object') return null;
  const planDoc = doc as Partial<PlanDocumentV1>;

  if (planDoc.schemaVersion !== SCHEMA_VERSION || !planDoc.planInput) return null;

  // 最低限のデフォルトを付与（既存の初期値と同等）
  const defaults: FlightPlan = {
    departure: undefined,
    arrival: undefined,
    waypoints: [],
    altitude: 30000,
    speed: 250,
    tas: 0,
    mach: 0,
    totalDistance: 0,
    ete: '',
    eta: '',
    departureTime: '00:00',
    groundTempC: 15,
    groundElevationFt: 0,
    routeSegments: [],
  };

  return {
    ...defaults,
    ...planDoc.planInput,
    waypoints: planDoc.planInput.waypoints ?? [],
    routeSegments: planDoc.planInput.routeSegments ?? [],
  };
};

// ダウンロード用ユーティリティ
export const downloadPlanDocument = (doc: PlanDocumentV1, filename?: string) => {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `flight-plan-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

