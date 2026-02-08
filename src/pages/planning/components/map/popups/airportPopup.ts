import { escapeHtml } from './common';

const formatRunway = (runwayInfo: string): string => {
  if (!runwayInfo) return '';
  const match = runwayInfo.match(/RWY(\d+)\/(\d+)\s+(\d+)\*(\d+)/i);
  if (match) {
    const rwy1 = match[1];
    const rwy2 = match[2];
    const length = match[3];
    const width = match[4];
    return `${rwy1}-${rwy2}(${length}*${width})`;
  }
  return runwayInfo;
};

export const simplifiedAirportInfoContent = (properties: Record<string, any>): string => {
  const rwy1Info = properties.RWY1
    ? `<div class="text-sm airport-item">
         <div class="airport-label">滑走路１：</div>
         <div class="airport-value hud-readout">${escapeHtml(formatRunway(properties.RWY1 as string))}</div>
       </div>`
    : '';

  const elevInfo = properties['Elev(ft)']
    ? `<div class="text-sm airport-item">
         <div class="airport-label">標高：</div>
         <div class="airport-value hud-readout">${escapeHtml(String(properties['Elev(ft)']))}ft</div>
       </div>`
    : '';

  return `${rwy1Info}${elevInfo}`;
};

export const fullAirportInfoContent = (properties: Record<string, any>): string => {
  const rows: string[] = [];
  const pushRow = (label: string, value?: string) => {
    if (!value) return;
    rows.push(`<div class="text-sm airport-item"><div class="airport-label">${escapeHtml(label)}：</div><div class="airport-value hud-readout">${escapeHtml(value)}</div></div>`);
  };

  pushRow('滑走路２', properties.RWY2);
  pushRow('ILS', properties.ILS);
  pushRow('TWR', properties.TWR);
  pushRow('APP', properties.APP);
  pushRow('GND', properties.GND);
  pushRow('備考', properties.REMARKS);

  return rows.join('\n');
};


