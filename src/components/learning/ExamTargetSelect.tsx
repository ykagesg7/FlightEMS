import React, { useEffect, useMemo } from 'react';
import type { LicenseTarget } from '../../utils/cohort';
import {
  formatExamMonthOption,
  getDefaultExamYearMonth,
  getExamMonthOptions,
  getExamYearOptions,
  parseExamYm,
  toExamYm,
} from '../../utils/examSchedule';

const selectClassName =
  'w-full rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]';

export interface ExamTargetSelectProps {
  license: LicenseTarget;
  examYm: string;
  onExamYmChange: (examYm: string) => void;
  idPrefix?: string;
}

export const ExamTargetSelect: React.FC<ExamTargetSelectProps> = ({
  license,
  examYm,
  onExamYmChange,
  idPrefix = 'exam',
}) => {
  const parsed = parseExamYm(examYm);
  const year = parsed?.year ?? getDefaultExamYearMonth(license).year;
  const month = parsed?.month ?? getDefaultExamYearMonth(license).month;

  const yearOptions = useMemo(() => getExamYearOptions(), []);
  const monthOptions = useMemo(
    () => getExamMonthOptions(license, year),
    [license, year],
  );

  useEffect(() => {
    if (monthOptions.length === 0) {
      const next = getDefaultExamYearMonth(license);
      if (next.examYm !== examYm) onExamYmChange(next.examYm);
      return;
    }
    if (!monthOptions.includes(month)) {
      onExamYmChange(toExamYm(year, monthOptions[0]));
    }
  }, [examYm, license, month, monthOptions, onExamYmChange, year]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label htmlFor={`${idPrefix}-year`} className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          年
        </label>
        <select
          id={`${idPrefix}-year`}
          value={year}
          onChange={(e) => {
            const nextYear = Number(e.target.value);
            const nextMonths = getExamMonthOptions(license, nextYear);
            const nextMonth = nextMonths.includes(month) ? month : nextMonths[0];
            if (nextMonth) onExamYmChange(toExamYm(nextYear, nextMonth));
          }}
          className={selectClassName}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-month`} className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
          月
        </label>
        <select
          id={`${idPrefix}-month`}
          value={monthOptions.includes(month) ? month : monthOptions[0] ?? month}
          onChange={(e) => onExamYmChange(toExamYm(year, Number(e.target.value)))}
          className={selectClassName}
          disabled={monthOptions.length === 0}
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {formatExamMonthOption(m)}
            </option>
          ))}
        </select>
      </div>
      <p className="col-span-2 text-xs text-[var(--text-muted)]">
        学科試験の実施月のみ選択できます（国交省 CBT 年6回: 1・3・6・7・9・11月）。
      </p>
    </div>
  );
};
