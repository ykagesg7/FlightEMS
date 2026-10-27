export type PlanningGuideStep = 1 | 2 | 3;

interface PlanningGuidedFlowProps {
  activeStep: PlanningGuideStep;
}

const STEPS: { step: PlanningGuideStep; label: string }[] = [
  { step: 1, label: '出発・到着空港を選ぶ' },
  { step: 2, label: 'ルート確認' },
  { step: 3, label: 'NavLog' },
];

export function PlanningGuidedFlow({ activeStep }: PlanningGuidedFlowProps) {
  return (
    <nav
      className="rounded-lg border border-whiskyPapa-yellow/25 bg-whiskyPapa-black/60 px-3 py-3 sm:px-4"
      aria-label="Planning の進め方"
    >
      <p className="mb-2 text-xs font-medium text-whiskyPapa-yellow sm:text-sm">はじめての手順</p>
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {STEPS.map(({ step, label }) => {
          const isActive = step === activeStep;
          const isDone = step < activeStep;
          return (
            <li
              key={step}
              className={`flex min-h-[44px] flex-1 items-center gap-2 rounded-md border px-3 py-2 text-xs sm:text-sm ${
                isActive
                  ? 'border-whiskyPapa-yellow/50 bg-whiskyPapa-yellow/10 text-white'
                  : isDone
                    ? 'border-whiskyPapa-yellow/20 text-gray-300'
                    : 'border-whiskyPapa-yellow/10 text-gray-400'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-whiskyPapa-yellow text-whiskyPapa-black'
                    : isDone
                      ? 'bg-whiskyPapa-yellow/30 text-whiskyPapa-yellow'
                      : 'bg-whiskyPapa-black-dark text-gray-500'
                }`}
              >
                {step}
              </span>
              <span className="leading-snug">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function resolvePlanningGuideStep(
  routeReady: boolean,
  navLogSegmentCount: number,
): PlanningGuideStep {
  if (!routeReady) return 1;
  if (navLogSegmentCount <= 0) return 2;
  return 3;
}
