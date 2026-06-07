import { useCallback, useState } from 'react';
import supabase from '../../../utils/supabase';
import { trackQuizQuestionReport } from '../../../lib/quizAnalytics';
import {
  formatQuestionReportError,
  type QuestionReportContext,
  type QuestionReportType,
} from '../utils/questionReportTypes';
import { mergeReportContextWithLocation, type QuestionReportSource } from '../utils/questionReportLinks';

export type SubmitQuestionReportParams = {
  questionId: string;
  reportType: QuestionReportType;
  comment?: string;
  context?: QuestionReportContext;
  mainSubject?: string;
  reportSource?: QuestionReportSource;
};

export function useQuestionReport() {
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitReport = useCallback(async (params: SubmitQuestionReportParams) => {
    setSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        setErrorMessage('報告するにはログインが必要です。');
        return false;
      }

      const comment = params.comment?.trim() ?? '';
      const context = mergeReportContextWithLocation(
        params.context,
        params.reportSource ?? 'quiz_active',
      );
      const { data: inserted, error } = await supabase.from('question_issue_reports').insert({
        user_id: userData.user.id,
        question_id: params.questionId,
        report_type: params.reportType,
        comment: comment || null,
        context,
        status: 'open',
      }).select('id').single();

      if (error || !inserted?.id) throw error ?? new Error('報告の保存に失敗しました');

      trackQuizQuestionReport({
        report_type: params.reportType,
        main_subject: params.mainSubject,
      });
      setSuccessMessage('報告を受け付けました。内容を確認します。');
      return true;
    } catch (err) {
      setErrorMessage(formatQuestionReportError(err));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setSuccessMessage(null);
    setErrorMessage(null);
  }, []);

  return {
    submitting,
    successMessage,
    errorMessage,
    submitReport,
    clearMessages,
  };
}
