import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export const MapLayersCollapsibleBlock: React.FC<Props> = ({
  title,
  defaultOpen = true,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-whiskyPapa-yellow/15">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-semibold text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/5"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
        {title}
      </button>
      {open ? <div className="px-3 pb-2">{children}</div> : null}
    </section>
  );
};
