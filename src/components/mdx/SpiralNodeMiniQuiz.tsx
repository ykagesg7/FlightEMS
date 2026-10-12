import React, { useMemo, useState } from 'react';
import type { SpiralMiniQuizAnswerPayload } from '../../types/spiralLmsMiniQuiz';
import { useNodeMiniQuizQuestions, useSubmitSpiralMiniQuiz } from '../../hooks/useSubmitSpiralMiniQuiz';
import { isSpiralLmsFeatureEnabled } from '../../utils/spiralLmsFeature';

export type SpiralNodeMiniQuizProps = {
  /** Spiral LMS node id (e.g. SPIRAL-DEV-MINI in dev seed). */
  nodeId: string;
};

/**
 * MDX embed for spiral LMS node mini-quizzes. Server grades answers; stems never include correctness.
 */
const SpiralNodeMiniQuiz: React.FC<SpiralNodeMiniQuizProps> = ({ nodeId }) => {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const questionsQuery = useNodeMiniQuizQuestions(nodeId);
  const submit = useSubmitSpiralMiniQuiz(nodeId);
  const questions = questionsQuery.data ?? [];

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const revealPerQuestionResults = Boolean(submit.data?.results?.length);

  const resultByQuestionId = useMemo(() => {
    const map = new Map<string, boolean>();
    if (!submit.data?.results) {
      return map;
    }
    for (const row of submit.data.results) {
      map.set(row.question_id, row.correct);
    }
    return map;
  }, [submit.data?.results]);

  if (!featureEnabled) {
    return null;
  }

  if (questionsQuery.isLoading) {
    return (
      <div className="my-8 h-24 animate-pulse rounded-lg bg-brand-surface" aria-hidden />
    );
  }

  if (questionsQuery.isError) {
    return (
      <p className="my-6 text-sm text-[var(--text-secondary)]" role="status">
        ミニテストを読み込めませんでした。
      </p>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  const toggleOption = (questionId: string, optionId: string, type: 'single' | 'multiple') => {
    if (submitted) {
      return;
    }
    setSelections((prev) => {
      const current = prev[questionId] ?? [];
      if (type === 'single') {
        return { ...prev, [questionId]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const buildAnswers = (): SpiralMiniQuizAnswerPayload[] =>
    questions.map((q) => ({
      question_id: q.id,
      selected_option_ids: selections[q.id] ?? [],
    }));

  const allAnswered = questions.every((q) => (selections[q.id]?.length ?? 0) > 0);

  const handleSubmit = async () => {
    if (!allAnswered || submit.isPending) {
      return;
    }
    try {
      await submit.submitMiniQuizAsync(buildAnswers());
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const handleRetry = () => {
    submit.reset();
    setSelections({});
    setSubmitted(false);
    submit.resetClientAttemptId();
  };

  const passed = submit.data?.passed;
  const score = submit.data?.score;
  const showResults = submitted && (submit.isSuccess || submit.isError);

  return (
    <div className="my-8 space-y-6 rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
      <div className="bg-indigo-700 px-4 py-3 text-white">
        <h3 className="text-lg font-bold">ノードミニテスト</h3>
        <p className="mt-1 text-sm text-indigo-100">回答はサーバで採点されます（正解は表示されません）。</p>
      </div>

      {questions.map((question, index) => (
        <div key={question.id} className="border-t border-gray-100 px-4 py-4">
          <p className="mb-3 font-medium text-[var(--text-primary)]">
            問{index + 1}. {question.prompt}
          </p>
          <div className="space-y-2">
            {question.options.map((option) => {
              const selected = (selections[question.id] ?? []).includes(option.id);
              const graded = submitted && revealPerQuestionResults && resultByQuestionId.has(question.id);
              const correct = resultByQuestionId.get(question.id);
              let optionClass =
                'border rounded-md p-3 flex items-start cursor-pointer hover:bg-gray-50';
              if (graded) {
                if (selected && correct === false) {
                  optionClass += ' bg-red-50 border-red-500';
                } else if (selected && correct === true) {
                  optionClass += ' bg-green-50 border-green-500';
                }
              } else if (selected) {
                optionClass += ' bg-indigo-50 border-indigo-500';
              }

              return (
                <div
                  key={option.id}
                  className={optionClass}
                  onClick={() => toggleOption(question.id, option.id, question.question_type)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleOption(question.id, option.id, question.question_type);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="mr-3 flex-shrink-0">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'
                      }`}
                    >
                      {selected ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                    </div>
                  </div>
                  <div className="text-[var(--text-primary)]">{option.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
        {!showResults ? (
          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={!allAnswered || !submit.isReady || submit.isPending}
            className={`rounded-md px-4 py-2 ${
              !allAnswered || !submit.isReady || submit.isPending
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            回答を送信
          </button>
        ) : (
          <div>
            {submit.isError ? (
              <p className="mb-3 text-sm text-red-700" role="alert">
                送信に失敗しました。もう一度お試しください。
              </p>
            ) : (
              <p
                className={`mb-3 rounded-md p-3 text-sm ${
                  passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
                role="status"
              >
                {passed
                  ? `合格です（${score ?? '—'} 点）。`
                  : `不合格です（${score ?? '—'} 点）。もう一度挑戦できます。`}
              </p>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              もう一度挑戦
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpiralNodeMiniQuiz;
