import { describe, it, expect } from 'vitest';
import { summarizeDigitalNotamXml } from '../../../api/_lib/swimNotamCore';

const RUNWAY_CLOSURE_XML = `
<AIXMBasicMessage xmlns="http://www.aixm.aero/schema/5.1">
  <hasMember>
    <RunwayDirection gml:id="RWY16L">
      <timeSlice>
        <RunwayDirectionTimeSlice>
          <interpretation>滑走路16Lは閉鎖。代替として滑走路16Rを使用すること。</interpretation>
          <note>NOTAM TEST NOTE</note>
          <designator>16L</designator>
          <validTime>
            <TimePeriod>
              <beginPosition>2026-06-08T05:00:00Z</beginPosition>
              <endPosition>2026-06-09T21:00:00Z</endPosition>
            </TimePeriod>
          </validTime>
        </RunwayDirectionTimeSlice>
      </timeSlice>
    </RunwayDirection>
  </hasMember>
  urn:uuid RJFF_RWY16L.CLS.JP_20260608
</AIXMBasicMessage>
`;

const TAXIWAY_XML = `
<AIXMBasicMessage>
  <hasMember>
    <TaxiwayElement>
      <timeSlice>
        <TaxiwayElementTimeSlice>
          <note>TWY A部分通行止め</note>
          <designator>A</designator>
        </TaxiwayElementTimeSlice>
      </timeSlice>
    </TaxiwayElement>
  </hasMember>
  RJFF_TWCL.LIM.JP_20260608
</AIXMBasicMessage>
`;

describe('summarizeDigitalNotamXml', () => {
  it('extracts primaryText from interpretation and builds runway impactLabel', () => {
    const s = summarizeDigitalNotamXml(RUNWAY_CLOSURE_XML, 0, { includeRawXml: false });
    expect(s.primaryText).toContain('滑走路16L');
    expect(s.category).toBe('runway');
    expect(s.impactLabel).toMatch(/RJFF/);
    expect(s.impactLabel).toMatch(/16L/);
    expect(s.impactLabel).toMatch(/閉鎖/);
    expect(s.sortPriority).toBeGreaterThanOrEqual(100);
    expect(s.rawXml).toBeUndefined();
  });

  it('classifies taxiway and assigns lower sort priority than runway closure', () => {
    const s = summarizeDigitalNotamXml(TAXIWAY_XML, 0, { includeRawXml: false });
    expect(s.category).toBe('taxiway');
    expect(s.primaryText).toContain('TWY A');
    expect(s.impactLabel).toMatch(/誘導路/);
    expect(s.sortPriority).toBeLessThan(105);
  });

  it('includes rawXml when includeRawXml is true', () => {
    const s = summarizeDigitalNotamXml(TAXIWAY_XML, 0, { includeRawXml: true });
    expect(s.rawXml).toContain('TaxiwayElement');
  });
});
