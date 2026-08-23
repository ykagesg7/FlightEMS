import React from 'react';

interface PlanningCardProps {
  title: string;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function PlanningCard({ title, defaultOpen = true, headerRight, children }: PlanningCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <details
      className="rounded-lg border border-whiskyPapa-yellow/20 bg-whiskyPapa-black-dark"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-whiskyPapa-yellow sm:px-4">
        <span>{title}</span>
        {headerRight ? <span className="font-normal">{headerRight}</span> : null}
      </summary>
      <div className="border-t border-whiskyPapa-yellow/10 p-3 sm:p-4 md:p-5">{children}</div>
    </details>
  );
}
