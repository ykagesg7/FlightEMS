import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

export type FilterListboxOption<T extends string | number> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type FilterListboxProps<T extends string | number> = {
  value: T;
  options: Array<FilterListboxOption<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
  buttonClassName?: string;
  /** false のとき選択ラベルを省略しない（例: 「10問」が狭列で「1...」になるのを防ぐ） */
  truncateSelection?: boolean;
};

export const FilterListbox = <T extends string | number>({
  value,
  options,
  onChange,
  disabled = false,
  buttonClassName = '',
  truncateSelection = true,
}: FilterListboxProps<T>) => {
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <Listbox value={selectedOption?.value ?? value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button
          type="button"
          title={selectedOption?.label ? String(selectedOption.label) : undefined}
          className={`quiz-filter-button flex w-full items-center justify-between gap-3 rounded-xl border border-brand-primary/20 bg-[var(--panel)]/70 px-4 py-3 text-left text-base font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-brand-primary/40 hover:bg-brand-primary/5 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
        >
          <span className={truncateSelection ? 'min-w-0 truncate' : 'whitespace-nowrap'}>
            {selectedOption?.label ?? ''}
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="quiz-filter-popup absolute left-0 right-auto z-40 mt-2 max-h-72 min-w-full w-max max-w-[min(100vw-2rem,36rem)] overflow-auto rounded-xl border border-brand-primary/20 bg-[var(--panel)]/98 p-2 shadow-[0_20px_45px_rgba(2,8,23,0.78)] ring-1 ring-brand-primary/10 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={`${String(option.value)}-${option.label}`}
                value={option.value}
                disabled={option.disabled}
                className={({ active, selected, disabled: optionDisabled }) =>
                  [
                    'flex w-full min-w-0 cursor-pointer items-start gap-2 rounded-lg px-3 py-3 text-sm transition',
                    active ? 'bg-brand-primary/12' : '',
                    selected ? 'border border-brand-primary/35 bg-brand-primary/15 text-brand-primary' : 'border border-transparent text-[var(--text-primary)]',
                    optionDisabled ? 'cursor-not-allowed opacity-55' : '',
                  ].join(' ')
                }
              >
                {({ selected }) => (
                  <>
                    <span className="min-w-0 flex-1 break-words text-left leading-snug">
                      {option.label}
                    </span>
                    {selected ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
                    ) : (
                      <span className="mt-0.5 inline-block h-4 w-4 shrink-0" aria-hidden />
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
