import { describe, expect, it } from 'vitest';
import {
  ALL_SUBJECT_VALUE,
  buildContentTestHref,
  buildDiagnosticHref,
  buildReviewHref,
  applyPartialTestHubState,
  areTestHubSearchParamsEqual,
  buildTestHubSearchParams,
  buildWeakSubjectHref,
  countActiveTestFilters,
  DEFAULT_TEST_HUB_STATE,
  DIAGNOSTIC_DEFAULT_COUNT,
  getVisibleTestHubTabs,
  hubStateToFetchMode,
  isTestFiltersLocked,
  parseLegacyTestHubParams,
  parseTestHubSearchParams,
  PLACEHOLDER_SUBJECT,
} from '../../pages/test/testHubFilters';

describe('testHubFilters', () => {
  it('defaults to diagnostic tab with 10 questions', () => {
    const state = parseTestHubSearchParams(new URLSearchParams());
    expect(state.tab).toBe('diagnostic');
    expect(state.count).toBe(DIAGNOSTIC_DEFAULT_COUNT);
    expect(state.mode).toBe('practice');
  });

  it('maps legacy mode=review to review tab', () => {
    const legacy = parseLegacyTestHubParams(new URLSearchParams('mode=review'));
    expect(legacy.tab).toBe('review');
    expect(legacy.mode).toBe('review');
  });

  it('maps legacy subject param to subject tab', () => {
    const legacy = parseLegacyTestHubParams(
      new URLSearchParams('subject=航空工学&count=15')
    );
    expect(legacy.tab).toBe('subject');
    expect(legacy.subject).toBe('航空工学');
    expect(legacy.count).toBe(15);
  });

  it('contentId forces content tab', () => {
    const state = parseTestHubSearchParams(
      new URLSearchParams('contentId=3.2.7_LiftAndDrag&subject=航空工学')
    );
    expect(state.tab).toBe('content');
    expect(state.contentId).toBe('3.2.7_LiftAndDrag');
    expect(getVisibleTestHubTabs(state.contentId)).toEqual(['content']);
  });

  it('buildTestHubSearchParams omits default tab and count', () => {
    const params = buildTestHubSearchParams(DEFAULT_TEST_HUB_STATE);
    expect(params.get('tab')).toBeNull();
    expect(params.get('count')).toBeNull();
    expect(params.get('mode')).toBeNull();
  });

  it('buildTestHubSearchParams includes non-default values', () => {
    const params = buildTestHubSearchParams({
      ...DEFAULT_TEST_HUB_STATE,
      tab: 'subject',
      subject: '航空気象',
      sub: '大気の基礎/温度',
      count: 15,
      mode: 'exam',
      exam: 'ppl',
      sort: 'syllabus',
    });
    expect(params.get('tab')).toBe('subject');
    expect(params.get('subject')).toBe('航空気象');
    expect(params.get('sub')).toBe('大気の基礎/温度');
    expect(params.get('count')).toBe('15');
    expect(params.get('mode')).toBe('exam');
    expect(params.get('exam')).toBe('ppl');
    expect(params.get('sort')).toBe('syllabus');
  });

  it('isTestFiltersLocked for review and content', () => {
    expect(isTestFiltersLocked({ ...DEFAULT_TEST_HUB_STATE, tab: 'review' })).toBe(true);
    expect(
      isTestFiltersLocked({
        ...DEFAULT_TEST_HUB_STATE,
        tab: 'content',
        contentId: 'x',
      })
    ).toBe(true);
    expect(isTestFiltersLocked({ ...DEFAULT_TEST_HUB_STATE, tab: 'diagnostic' })).toBe(false);
  });

  it('hubStateToFetchMode maps tabs', () => {
    expect(hubStateToFetchMode({ ...DEFAULT_TEST_HUB_STATE, tab: 'diagnostic' })).toBe('practice');
    expect(hubStateToFetchMode({ ...DEFAULT_TEST_HUB_STATE, tab: 'review' })).toBe('review');
    expect(
      hubStateToFetchMode({ ...DEFAULT_TEST_HUB_STATE, tab: 'subject', mode: 'exam' })
    ).toBe('exam');
  });

  it('countActiveTestFilters counts non-default filters', () => {
    expect(countActiveTestFilters(DEFAULT_TEST_HUB_STATE)).toBe(0);
    expect(
      countActiveTestFilters({
        ...DEFAULT_TEST_HUB_STATE,
        exam: 'ppl',
        mode: 'exam',
        tab: 'subject',
        sub: 'x',
        count: 20,
        sort: 'syllabus',
      })
    ).toBe(5);
  });

  it('buildContentTestHref includes contentId and tab', () => {
    const href = buildContentTestHref({
      contentId: '3.2.7_LiftAndDrag',
      subject: '航空工学',
      exam: 'ppl',
    });
    expect(href).toContain('contentId=3.2.7_LiftAndDrag');
    expect(href).toContain('tab=content');
    expect(href).toContain('exam=ppl');
  });

  it('buildDiagnosticHref defaults to /test', () => {
    expect(buildDiagnosticHref()).toBe('/test');
    expect(buildDiagnosticHref(15)).toBe('/test?count=15');
  });

  it('buildReviewHref sets review tab and mode', () => {
    const href = buildReviewHref();
    expect(href).toContain('tab=review');
    expect(href).toContain('mode=review');
  });

  it('buildWeakSubjectHref sets subject tab', () => {
    const href = buildWeakSubjectHref('航空気象');
    expect(href).toContain('tab=subject');
    expect(href).toContain('subject=');
  });

  it('parseTestHubSearchParams handles exam=ppl', () => {
    const state = parseTestHubSearchParams(new URLSearchParams('exam=ppl&tab=subject&subject=航空工学'));
    expect(state.exam).toBe('ppl');
    expect(state.subject).toBe('航空工学');
    expect(state.sub).toBe(ALL_SUBJECT_VALUE);
    expect(state.subject).not.toBe(PLACEHOLDER_SUBJECT);
  });

  it('applyPartialTestHubState maps review tab to review mode', () => {
    const next = applyPartialTestHubState(DEFAULT_TEST_HUB_STATE, { tab: 'review' });
    expect(next.tab).toBe('review');
    expect(next.mode).toBe('review');
  });

  it('areTestHubSearchParamsEqual compares serialized params', () => {
    const a = new URLSearchParams('tab=review&mode=review');
    const b = new URLSearchParams('mode=review&tab=review');
    expect(areTestHubSearchParamsEqual(a, b)).toBe(false);
    expect(areTestHubSearchParamsEqual(a, new URLSearchParams(a.toString()))).toBe(true);
  });

  it('parseTestHubSearchParams normalizes count=0 to default', () => {
    const state = parseTestHubSearchParams(new URLSearchParams('count=0'));
    expect(state.count).toBe(DIAGNOSTIC_DEFAULT_COUNT);
  });
});
