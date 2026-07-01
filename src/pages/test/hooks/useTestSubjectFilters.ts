import { useEffect, useMemo, useState } from 'react';
import type { FilterListboxOption } from '../components/FilterListbox';
import type { ExamLevelFilter } from '../examLevelFilter';
import {
  ALL_OPTION_VALUE,
  EMPTY_SUB_SUBJECT_RAW_VALUES,
  formatFilterOptionLabel,
  mergeSelectedIntoMatches,
  sortFilterOptionsByPriority,
  sortFilterOptionsBySyllabus,
  sortOptionList,
  SUB_SUBJECT_ORDER_INDEX_BY_MAIN,
  MAIN_SUBJECT_ORDER_INDEX,
  type FilterOption,
  type FilterSortOrder,
  type SubSubjectOption,
} from '../testFilterOptionUtils';
import { PLACEHOLDER_SUBJECT, type TestHubTab } from '../testHubFilters';
import { normalizeSubSubjectLabel } from '../utils/normalizeSubSubject';
import supabase from '../../../utils/supabase';

type UpdateHubState = (partial: {
  subject?: string;
  sub?: string;
  count?: number;
}) => void;

export function useTestSubjectFilters(params: {
  hubTab: TestHubTab;
  selectedSubject: string;
  selectedSubSubject: string;
  questionCount: number;
  sortOrder: FilterSortOrder;
  examLevel: ExamLevelFilter;
  updateHubState: UpdateHubState;
}) {
  const { hubTab, selectedSubject, selectedSubSubject, questionCount, sortOrder, examLevel, updateHubState } = params;

  const [subjects, setSubjects] = useState<FilterOption[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [subSubjects, setSubSubjects] = useState<SubSubjectOption[]>([]);
  const [subSubjectSearch, setSubSubjectSearch] = useState('');
  const [subSubjectLoading, setSubSubjectLoading] = useState(false);
  const [questionCountOptions, setQuestionCountOptions] = useState<number[]>([10]);
  const [pplVerifiedExactCount, setPplVerifiedExactCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setSubjectLoading(true);
      try {
        let q = supabase
          .from('unified_cpl_questions')
          .select('main_subject, importance_score', { count: 'exact', head: false })
          .eq('verification_status', 'verified');
        if (examLevel === 'ppl') {
          q = q.contains('applicable_exams', ['PPL']);
        }
        const { data, error } = await q.limit(5000);
        if (error) throw error;
        const subjectStats = new Map<string, { count: number; importanceTotal: number }>();
        ((data ?? []) as Array<{ main_subject: unknown; importance_score: unknown }>)
          .filter(
            (row): row is { main_subject: string; importance_score: number | null } =>
              typeof row.main_subject === 'string' && row.main_subject.length > 0,
          )
          .forEach(({ main_subject, importance_score }) => {
            const entry = subjectStats.get(main_subject) ?? { count: 0, importanceTotal: 0 };
            entry.count += 1;
            entry.importanceTotal += typeof importance_score === 'number' ? importance_score : 0;
            subjectStats.set(main_subject, entry);
          });

        const subjectOptions = Array.from(subjectStats.entries())
          .map(([value, entry]) => ({
            value,
            label: value,
            count: entry.count,
            avgImportance: entry.count > 0 ? entry.importanceTotal / entry.count : 0,
          }))
          .sort(sortFilterOptionsByPriority);

        const options: FilterOption[] = [
          { value: PLACEHOLDER_SUBJECT, label: '科目を選択してください', count: 0, avgImportance: 0 },
          ...subjectOptions,
        ];
        setSubjects(options);
        if (!options.some((option) => option.value === selectedSubject)) {
          updateHubState({ subject: PLACEHOLDER_SUBJECT });
        }
      } catch {
        setSubjects([{ value: PLACEHOLDER_SUBJECT, label: '科目を選択してください', count: 0, avgImportance: 0 }]);
      } finally {
        setSubjectLoading(false);
      }
    };
    void fetchSubjects();
  }, [examLevel, selectedSubject, updateHubState]);

  useEffect(() => {
    if (examLevel !== 'ppl') {
      setPplVerifiedExactCount(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { count, error } = await supabase
        .from('unified_cpl_questions')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')
        .contains('applicable_exams', ['PPL']);
      if (!cancelled) {
        setPplVerifiedExactCount(error ? null : count ?? 0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examLevel]);

  useEffect(() => {
    if (hubTab !== 'subject') return;
    if (!selectedSubject || selectedSubject === ALL_OPTION_VALUE || selectedSubject === PLACEHOLDER_SUBJECT) {
      setSubSubjects([]);
      setSubSubjectSearch('');
      return;
    }
    setSubSubjectLoading(true);
    setSubSubjectSearch('');
    const fetchSubSubjects = async () => {
      try {
        let sq = supabase
          .from('unified_cpl_questions')
          .select('sub_subject, importance_score', { count: 'exact', head: false })
          .eq('main_subject', selectedSubject)
          .eq('verification_status', 'verified');
        if (examLevel === 'ppl') {
          sq = sq.contains('applicable_exams', ['PPL']);
        }
        const { data, error } = await sq;
        if (error) throw error;
        const normalizedMap = new Map<string, { rawValues: Set<string>; count: number; importanceTotal: number }>();
        ((data ?? []) as Array<{ sub_subject: unknown; importance_score: unknown }>)
          .filter(
            (row): row is { sub_subject: string; importance_score: number | null } =>
              typeof row.sub_subject === 'string' && row.sub_subject.length > 0,
          )
          .forEach(({ sub_subject: rawValue, importance_score }) => {
            const normalized = normalizeSubSubjectLabel(rawValue);
            if (!normalized) return;
            const entry = normalizedMap.get(normalized) ?? { rawValues: new Set<string>(), count: 0, importanceTotal: 0 };
            entry.rawValues.add(rawValue);
            entry.count += 1;
            entry.importanceTotal += typeof importance_score === 'number' ? importance_score : 0;
            normalizedMap.set(normalized, entry);
          });

        const options: SubSubjectOption[] = [
          {
            value: ALL_OPTION_VALUE,
            label: 'すべてのサブ科目',
            count: Array.from(normalizedMap.values()).reduce((sum, entry) => sum + entry.count, 0),
            avgImportance:
              normalizedMap.size > 0
                ? Array.from(normalizedMap.values()).reduce((sum, entry) => sum + entry.importanceTotal, 0) /
                  Array.from(normalizedMap.values()).reduce((sum, entry) => sum + entry.count, 0)
                : 0,
            rawValues: [],
          },
          ...Array.from(normalizedMap.entries())
            .map(([value, entry]) => ({
              value,
              label: value,
              count: entry.count,
              avgImportance: entry.count > 0 ? entry.importanceTotal / entry.count : 0,
              rawValues: Array.from(entry.rawValues).sort((a, b) => a.localeCompare(b, 'ja')),
            }))
            .sort(sortFilterOptionsByPriority),
        ];

        setSubSubjects(options);
        const direct = options.find((option) => option.value === selectedSubSubject);
        const byRaw = options.find((option) => option.rawValues.includes(selectedSubSubject));
        const nextSub = direct?.value ?? byRaw?.value ?? ALL_OPTION_VALUE;
        if (nextSub !== selectedSubSubject) {
          updateHubState({ sub: nextSub });
        }
      } catch {
        setSubSubjects([{ value: ALL_OPTION_VALUE, label: 'すべてのサブ科目', count: 0, avgImportance: 0, rawValues: [] }]);
        updateHubState({ sub: ALL_OPTION_VALUE });
      } finally {
        setSubSubjectLoading(false);
      }
    };
    void fetchSubSubjects();
  }, [hubTab, selectedSubject, examLevel, selectedSubSubject, updateHubState]);

  const selectedSubSubjectRawValues = useMemo(() => {
    if (selectedSubSubject === ALL_OPTION_VALUE) return EMPTY_SUB_SUBJECT_RAW_VALUES;
    return subSubjects.find((option) => option.value === selectedSubSubject)?.rawValues ?? EMPTY_SUB_SUBJECT_RAW_VALUES;
  }, [selectedSubSubject, subSubjects]);

  const orderedSubjects = useMemo(() => {
    const comparator =
      sortOrder === 'syllabus'
        ? (a: FilterOption, b: FilterOption) => sortFilterOptionsBySyllabus(a, b, MAIN_SUBJECT_ORDER_INDEX)
        : sortFilterOptionsByPriority;
    return sortOptionList(subjects, comparator, PLACEHOLDER_SUBJECT);
  }, [sortOrder, subjects]);

  const orderedSubSubjects = useMemo(() => {
    const syllabusOrderIndex =
      selectedSubject !== ALL_OPTION_VALUE ? SUB_SUBJECT_ORDER_INDEX_BY_MAIN[selectedSubject] : undefined;
    const comparator =
      sortOrder === 'syllabus'
        ? (a: SubSubjectOption, b: SubSubjectOption) => sortFilterOptionsBySyllabus(a, b, syllabusOrderIndex)
        : sortFilterOptionsByPriority;
    return sortOptionList(subSubjects, comparator);
  }, [selectedSubject, sortOrder, subSubjects]);

  const filteredSubjects = useMemo(() => {
    const keyword = subjectSearch.trim().toLocaleLowerCase('ja');
    if (!keyword) return orderedSubjects;
    const selected = orderedSubjects.find((option) => option.value === selectedSubject);
    const matches = orderedSubjects.filter((option) => {
      if (option.value === PLACEHOLDER_SUBJECT) return true;
      return option.label.toLocaleLowerCase('ja').includes(keyword);
    });
    return mergeSelectedIntoMatches(matches, selected);
  }, [orderedSubjects, selectedSubject, subjectSearch]);

  const filteredSubSubjects = useMemo(() => {
    const keyword = subSubjectSearch.trim().toLocaleLowerCase('ja');
    if (!keyword) return orderedSubSubjects;
    const selected = orderedSubSubjects.find((option) => option.value === selectedSubSubject);
    const matches = orderedSubSubjects.filter((option) => {
      if (option.value === ALL_OPTION_VALUE) return true;
      return option.label.toLocaleLowerCase('ja').includes(keyword);
    });
    return mergeSelectedIntoMatches(matches, selected);
  }, [orderedSubSubjects, selectedSubSubject, subSubjectSearch]);

  const subjectSelected = selectedSubject !== PLACEHOLDER_SUBJECT && selectedSubject !== ALL_OPTION_VALUE;
  const selectableMainSubjectCount = useMemo(
    () => subjects.filter((s) => s.value !== PLACEHOLDER_SUBJECT).length,
    [subjects],
  );

  const subjectListboxOptions = useMemo<FilterListboxOption<string>[]>(
    () =>
      filteredSubjects.map((subject) => ({
        value: subject.value,
        label: subject.label,
        disabled: subject.value === PLACEHOLDER_SUBJECT ? false : undefined,
      })),
    [filteredSubjects],
  );

  const subSubjectListboxOptions = useMemo<FilterListboxOption<string>[]>(
    () =>
      filteredSubSubjects.length === 0
        ? [{ value: ALL_OPTION_VALUE, label: formatFilterOptionLabel('一致するサブ科目なし', 0), disabled: true }]
        : filteredSubSubjects.map((subject) => ({
            value: subject.value,
            label: formatFilterOptionLabel(subject.label, subject.count),
          })),
    [filteredSubSubjects],
  );

  useEffect(() => {
    if (hubTab !== 'subject') return;
    const fetchCount = async () => {
      if (selectedSubject === PLACEHOLDER_SUBJECT || selectedSubject === ALL_OPTION_VALUE) {
        setQuestionCountOptions([]);
        return;
      }
      let query = supabase
        .from('unified_cpl_questions')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified')
        .eq('main_subject', selectedSubject);
      if (examLevel === 'ppl') {
        query = query.contains('applicable_exams', ['PPL']);
      }
      if (selectedSubSubjectRawValues.length > 0) {
        query = query.in('sub_subject', selectedSubSubjectRawValues);
      }
      const { count, error } = await query;
      let maxCount = count || 0;
      if (error) maxCount = 0;
      if (maxCount <= 0) {
        setQuestionCountOptions([]);
        return;
      }

      let options: number[] = [];
      if (maxCount < 10) {
        options = [maxCount];
      } else {
        for (let i = 10; i <= maxCount; i += 5) {
          options.push(i);
        }
        if (options[options.length - 1] !== maxCount) options.push(maxCount);
      }
      setQuestionCountOptions(options);
      if (!options.includes(questionCount)) {
        updateHubState({ count: options[0] });
      }
    };
    void fetchCount();
  }, [hubTab, selectedSubject, selectedSubSubject, selectedSubSubjectRawValues, examLevel, questionCount, updateHubState]);

  return {
    subjectSearch,
    setSubjectSearch,
    subjectLoading,
    subSubjectSearch,
    setSubSubjectSearch,
    subSubjectLoading,
    questionCountOptions,
    pplVerifiedExactCount,
    selectableMainSubjectCount,
    subjectSelected,
    selectedSubSubjectRawValues,
    subjectListboxOptions,
    subSubjectListboxOptions,
  };
}
