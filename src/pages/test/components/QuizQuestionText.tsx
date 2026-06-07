import React, { useMemo } from 'react';
import { parseQuizQuestionText } from '../utils/formatQuizQuestionText';

type QuizQuestionTextProps = {
  text: string;
  id?: string;
  className?: string;
};

export const QuizQuestionText: React.FC<QuizQuestionTextProps> = ({ text, id, className = '' }) => {
  const parsed = useMemo(() => parseQuizQuestionText(text), [text]);

  if (parsed.kind === 'plain') {
    return (
      <p id={id} className={`whitespace-pre-line leading-relaxed mb-3 hud-text ${className}`.trim()}>
        {parsed.text}
      </p>
    );
  }

  return (
    <div id={id} className={`mb-3 space-y-3 hud-text ${className}`.trim()}>
      {parsed.stem ? (
        <p className="leading-relaxed text-[var(--text-primary)]">{parsed.stem}</p>
      ) : null}
      <ul className="space-y-3 list-none m-0 p-0">
        {parsed.choices.map((choice) => (
          <li
            key={choice.label}
            className="rounded-lg border border-brand-primary/15 bg-[var(--panel)]/40 px-3 py-2.5 leading-relaxed"
          >
            <span className="mr-2 font-semibold text-brand-primary">({choice.label})</span>
            <span className="text-[var(--text-primary)]">{choice.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
