export interface BriefingItem {
  label: string;
  value: string;
  status?: 'ok' | 'warning' | 'info';
}

export interface PreflightBriefing {
  routeSummary: BriefingItem[];
  navLog: BriefingItem[];
  fuel: BriefingItem[];
  weatherAndNotam: BriefingItem[];
  limitations: string[];
}
