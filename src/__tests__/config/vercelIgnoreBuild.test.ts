import { describe, expect, it } from 'vitest';
import {
  isSkippableDeployPath,
  shouldIgnoreBuild,
} from '../../../scripts/vercel-ignore-build.mjs';

describe('vercel ignored build step', () => {
  it('skips docs-only and similar paths', () => {
    expect(isSkippableDeployPath('docs/ops/Weekly_Telemetry_Review.md')).toBe(true);
    expect(isSkippableDeployPath('public/docs/05_Content_Pipeline.md')).toBe(true);
    expect(isSkippableDeployPath('.cursor/rules/core-project.mdc')).toBe(true);
    expect(isSkippableDeployPath('.github/workflows/weekly-telemetry-draft-pr.yml')).toBe(true);
    expect(isSkippableDeployPath('AGENTS.md')).toBe(true);
    expect(isSkippableDeployPath('scripts/telemetry/apply_week_review.py')).toBe(true);
    expect(isSkippableDeployPath('e2e/planning-debrief.spec.ts')).toBe(true);
    expect(
      shouldIgnoreBuild(['docs/ops/Weekly_Telemetry_Review.md', 'public/docs/09_CPL_Learning_Stub.md']),
    ).toBe(true);
  });

  it('builds when app, API, public assets, package files, or article MDX change', () => {
    const mustBuild = [
      'src/content/articles/1.1.4_WinWinThinking.mdx',
      'src/App.tsx',
      'api/cron.ts',
      'vercel.json',
      'public/images/ContentImages/image4.png',
      'index.html',
      'package.json',
      'package-lock.json',
      'vite.config.ts',
      'scripts/sync-public-docs.mjs',
    ];
    for (const path of mustBuild) {
      expect(isSkippableDeployPath(path)).toBe(false);
      expect(shouldIgnoreBuild([path])).toBe(false);
    }
  });

  it('builds when a docs-only commit also touches src or vercel.json', () => {
    expect(
      shouldIgnoreBuild(['docs/README.md', 'src/content/articles/habit.mdx']),
    ).toBe(false);
    expect(shouldIgnoreBuild(['docs/README.md', 'vercel.json'])).toBe(false);
  });

  it('builds when previous SHA or git diff is missing', () => {
    expect(shouldIgnoreBuild(['docs/README.md'], { missingPrevious: true })).toBe(false);
    expect(shouldIgnoreBuild(['docs/README.md'], { gitFailed: true })).toBe(false);
  });
});
