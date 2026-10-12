import type { SpiralLmsRecordAttemptResponse } from './spiralLms';

export type SpiralMiniQuizOption = {
  id: string;
  text: string;
};

export type SpiralMiniQuizQuestionRow = {
  id: string;
  node_id: string;
  sort_order: number;
  prompt: string;
  question_type: 'single' | 'multiple';
  options: SpiralMiniQuizOption[];
};

export type SpiralMiniQuizAnswerPayload = {
  question_id: string;
  selected_option_ids: string[];
};

export type SpiralMiniQuizQuestionResult = {
  question_id: string;
  correct: boolean;
};

export type SpiralMiniQuizSubmitResponse = SpiralLmsRecordAttemptResponse & {
  score: number;
  results: SpiralMiniQuizQuestionResult[];
};
