import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button, Typography } from '../../../components/ui';
import { cn } from '../../../utils';

const HUB_PATH = '/dev/spiral-lms';
const THREE_D_PATH = '/dev/spiral-lms/3d';

type SpiralLmsDevChromeProps = {
  onReload?: () => void;
  children: React.ReactNode;
};

export const SpiralLmsDevChrome: React.FC<SpiralLmsDevChromeProps> = ({ onReload, children }) => {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-4">
        <div className="space-y-2">
          <Typography variant="h1" className="text-2xl md:text-3xl">
            螺旋マトリックス LMS
          </Typography>
          <p className="text-sm text-[color:var(--text-secondary)]">
            開発プレビュー（VITE_SPIRAL_LMS_ENABLED）。本番ビルドには含まれません。
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2" aria-label="螺旋 LMS ビュー">
          <NavLink
            to={HUB_PATH}
            end
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'text-[color:var(--text-secondary)] hover:bg-gray-100',
              )
            }
          >
            2D 一覧
          </NavLink>
          <NavLink
            to={THREE_D_PATH}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'text-[color:var(--text-secondary)] hover:bg-gray-100',
              )
            }
          >
            3D 螺旋ビュー
          </NavLink>
          {onReload ? (
            <Button type="button" variant="secondary" size="sm" className="ml-auto" onClick={onReload}>
              再読み込み
            </Button>
          ) : null}
        </nav>
      </header>

      {children}
    </div>
  );
};
