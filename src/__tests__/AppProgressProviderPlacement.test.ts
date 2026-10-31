import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('App router / ProgressProvider placement (#155 regression)', () => {
  const appSource = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8');

  it('does not wrap RouterProvider with ProgressProvider in AppProviders', () => {
    const providersBlock = appSource.slice(
      appSource.indexOf('const AppProviders'),
      appSource.indexOf('function AppShell'),
    );
    expect(providersBlock).not.toContain('ProgressProvider');
  });

  it('mounts ProgressProvider inside AppShell (under RouterProvider)', () => {
    const shellBlock = appSource.slice(
      appSource.indexOf('function AppShell'),
      appSource.indexOf('const planning3dPopoutRoute'),
    );
    expect(shellBlock).toContain('ProgressProvider');
    expect(shellBlock).toContain('<Outlet />');
  });
});
