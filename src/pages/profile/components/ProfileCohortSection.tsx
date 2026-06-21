import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ExamTargetSelect } from '../../../components/learning/ExamTargetSelect';
import { Button, Card, Typography } from '../../../components/ui';
import { useCohortProfile } from '../../../hooks/useCohortProfile';
import { formatCohortKeyLabel, formatCohortPhaseLabel } from '../../../utils/cohort';
import {
  getDefaultExamYearMonth,
  getWrittenExamUnlockHint,
  isWrittenExamMonthReached,
} from '../../../utils/examSchedule';
import { markWrittenExamComplete, upsertUserCohort } from '../../../utils/cohortApi';

type ExamChoice = 'month' | 'undecided';

interface ProfileCohortSectionProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const ProfileCohortSection: React.FC<ProfileCohortSectionProps> = ({
  onError,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const { profile, invalidate, isLoading, fetchError } = useCohortProfile();
  const [examChoice, setExamChoice] = useState<ExamChoice>('month');
  const [examMonth, setExamMonth] = useState(() => getDefaultExamYearMonth('CPL').examYm);
  const [licenseTarget, setLicenseTarget] = useState<'CPL' | 'PPL'>('CPL');
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (profile.license_target === 'PPL') setLicenseTarget('PPL');
    if (profile.exam_date_status === 'undecided') {
      setExamChoice('undecided');
    } else if (profile.target_test_date) {
      setExamChoice('month');
      setExamMonth(profile.target_test_date.slice(0, 7));
    }
  }, [profile]);

  const handleSaveCohort = useCallback(async () => {
    if (examChoice === 'month' && !examMonth) {
      onError('試験年月を選択するか、受験日未定を選んでください');
      return;
    }
    setSaving(true);
    const { data, error } = await upsertUserCohort({
      license: licenseTarget,
      examYm: examChoice === 'month' ? examMonth : null,
      undecided: examChoice === 'undecided',
    });
    setSaving(false);
    if (error) {
      onError(error.message);
      return;
    }
    const savedKey = typeof data?.cohort_key === 'string' ? data.cohort_key : null;
    if (!savedKey) {
      onError('保存に失敗しました。サーバーからの応答が不正です。');
      return;
    }
    await queryClient.refetchQueries({ queryKey: ['cohort', 'profile'] });
    invalidate();
    onSuccess('受験予定を更新しました');
  }, [examChoice, examMonth, invalidate, licenseTarget, onError, onSuccess, queryClient]);

  const handleWrittenExamComplete = useCallback(async () => {
    setCompleting(true);
    const { error } = await markWrittenExamComplete();
    setCompleting(false);
    if (error) {
      onError(error.message);
      return;
    }
    invalidate();
    onSuccess('学科試験後フェーズに移行しました');
  }, [invalidate, onError, onSuccess]);

  if (isLoading) {
    return (
      <Card variant="brand" padding="lg">
        <Typography variant="body-sm" color="muted">読み込み中...</Typography>
      </Card>
    );
  }

  const canRecordWrittenExam =
    profile?.cohort_phase === 'active'
    && profile.exam_date_status === 'set'
    && isWrittenExamMonthReached(profile.target_test_date);

  const writtenExamUnlockHint = getWrittenExamUnlockHint(profile?.target_test_date ?? null);

  return (
    <div className="space-y-6">
      <Card variant="brand" padding="lg">
        <Typography variant="h3" color="brand" className="text-xl font-bold mb-2">
          学科試験の受験予定
        </Typography>
        <Typography variant="body-sm" color="muted" className="mb-4">
          現在: {formatCohortKeyLabel(profile?.cohort_key)} · フェーズ:{' '}
          {formatCohortPhaseLabel(profile?.cohort_phase)}
        </Typography>
        {fetchError instanceof Error && (
          <Typography variant="body-sm" className="mb-4 text-red-400">
            受験予定の読み込みに失敗しました: {fetchError.message}
          </Typography>
        )}

        <div className="space-y-4">
          <div>
            <span className="mb-2 block text-sm font-medium">資格</span>
            <select
              value={licenseTarget}
              onChange={(e) => setLicenseTarget(e.target.value as 'CPL' | 'PPL')}
              className="w-full rounded-lg border border-brand-primary/30 bg-brand-secondary-dark px-4 py-3"
            >
              <option value="CPL">CPL（事業用操縦士）</option>
              <option value="PPL">PPL（自家用操縦士）</option>
            </select>
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">受験予定</legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="profile-exam-choice"
                checked={examChoice === 'month'}
                onChange={() => setExamChoice('month')}
              />
              <span className="text-sm">試験年月を指定</span>
            </label>
            {examChoice === 'month' && (
              <ExamTargetSelect
                idPrefix="profile-exam"
                license={licenseTarget}
                examYm={examMonth}
                onExamYmChange={setExamMonth}
              />
            )}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="profile-exam-choice"
                checked={examChoice === 'undecided'}
                onChange={() => setExamChoice('undecided')}
              />
              <span className="text-sm">受験日未定</span>
            </label>
          </fieldset>
          <Button type="button" variant="brand" disabled={saving} onClick={() => void handleSaveCohort()}>
            {saving ? '保存中...' : '受験予定を保存'}
          </Button>
        </div>
      </Card>

      {canRecordWrittenExam && (
        <Card variant="brand" padding="lg">
          <Typography variant="h3" color="brand" className="text-lg font-bold mb-2">
            学科試験完了
          </Typography>
          <Typography variant="body-sm" color="muted" className="mb-4">
            学科試験が終わったら記録してください。学科試験後フェーズでは FMT など実技記事が推奨されます。
          </Typography>
          <Button
            type="button"
            variant="secondary"
            disabled={completing}
            onClick={() => void handleWrittenExamComplete()}
          >
            {completing ? '処理中...' : '学科試験完了'}
          </Button>
        </Card>
      )}

      {profile?.cohort_phase === 'active'
        && profile.exam_date_status === 'set'
        && !canRecordWrittenExam
        && writtenExamUnlockHint && (
        <Typography variant="body-sm" color="muted">
          学科試験完了の記録は{writtenExamUnlockHint}。
        </Typography>
      )}

      {profile?.exam_date_status === 'undecided' && (
        <Typography variant="body-sm" color="muted">
          受験日未定の間は学科試験後のリマインドは送られません。試験月を設定すると準備が始まります。
        </Typography>
      )}

      {profile?.cohort_phase === 'post_written' && (
        <Card variant="brand" padding="lg">
          <Typography variant="body-sm" color="muted" className="mb-3">
            学科試験後フェーズ — 実技・編隊飛行の学習を続けましょう。
          </Typography>
          <Link to="/articles?hub=fmt" className="text-sm text-[color:var(--hud-primary)] underline">
            FMT 編隊飛行シリーズを開く
          </Link>
        </Card>
      )}
    </div>
  );
};
