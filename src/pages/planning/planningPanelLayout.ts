/** Planning 左パネル: 全幅タブ vs 2画面 split 左列 */
export type PlanningPanelLayout = 'full' | 'split';

/** split は flex 縦積み（子の lg:col-span-* が暗黙3列を作らないよう grid を避ける） */
export function planningTabRootGridClass(layout: PlanningPanelLayout): string {
  return layout === 'split'
    ? 'flex flex-col gap-3 sm:gap-4 md:gap-6 min-w-0 w-full'
    : 'grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6';
}

export function planningTabPrintWrapperClass(layout: PlanningPanelLayout): string {
  return layout === 'split' ? '' : 'lg:col-span-3';
}

export function flightParametersGridClass(layout: PlanningPanelLayout): string {
  return layout === 'split'
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4';
}

/** split かつ viewport が xl 未満のときは地図レイヤーをインラインサイドバーにしない */
export function mapLayersUseInlineSidebar(layout: PlanningPanelLayout, isXlViewport: boolean): boolean {
  return layout !== 'split' || isXlViewport;
}
