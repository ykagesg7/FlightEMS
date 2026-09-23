import { CPL_CATEGORY, PPL_CATEGORY } from '../constants/articleHubCategories';

export type CourseModuleSource =
  | { kind: 'sub_category'; category: string; subCategory: string }
  | { kind: 'series'; series: string }
  | { kind: 'series_prefix'; series: string; idPrefix: string };

export interface CourseModuleDef {
  id: string;
  title: string;
  source: CourseModuleSource;
}

export interface CourseDef {
  id: string;
  title: string;
  audience: string;
  description: string;
  modules: CourseModuleDef[];
}

const PPL_SUBJECTS = ['工学', '気象', '法規', '航法', '通信'] as const;
const CPL_SUBJECTS = ['工学', '気象', '法規', '航法', '通信'] as const;

const CP_PHASES = [
  { id: 'cp-1', title: 'CP-1 基礎', prefix: 'CP-1-' },
  { id: 'cp-2', title: 'CP-2 失速・操縦', prefix: 'CP-2-' },
  { id: 'cp-3', title: 'CP-3 パターン', prefix: 'CP-3-' },
  { id: 'cp-4', title: 'CP-4 姿勢', prefix: 'CP-4-' },
  { id: 'cp-5', title: 'CP-5 曲技', prefix: 'CP-5-' },
] as const;

const MENTALITY_SERIES = [
  '訓練の当たり前',
  '戦闘機乗りの心構え',
  '７つの習慣',
  'ビジョナリー・カンパニー',
  'GIVE&TAKE',
  'ロジカルプレゼンテーション',
  'アナロジー思考',
  'Millionaire Teaching',
  '思考と人生',
  '空飛ぶ天神様の居酒屋談義',
] as const;

export const COURSES: CourseDef[] = [
  {
    id: 'ppl',
    title: 'PPL 学科',
    audience: 'PPL',
    description: 'Private Pilot License 学科試験向けの 5 科目コース。',
    modules: PPL_SUBJECTS.map((subCategory) => ({
      id: `ppl-${subCategory}`,
      title: subCategory === '工学' ? '航空工学' : `航空${subCategory}`,
      source: {
        kind: 'sub_category' as const,
        category: PPL_CATEGORY,
        subCategory,
      },
    })),
  },
  {
    id: 'cpl',
    title: 'CPL 学科',
    audience: 'CPL',
    description: 'Commercial Pilot License 学科試験向けコース。',
    modules: [
      {
        id: 'cpl-intro',
        title: '導入',
        source: { kind: 'series', series: 'CPL-Learning-Stub' },
      },
      ...CPL_SUBJECTS.map((subCategory) => ({
        id: `cpl-${subCategory}`,
        title: subCategory === '工学' ? '航空工学' : `航空${subCategory}`,
        source: {
          kind: 'sub_category' as const,
          category: CPL_CATEGORY,
          subCategory,
        },
      })),
    ],
  },
  {
    id: 'cp',
    title: 'CP（Contact Phase）',
    audience: 'USAF',
    description: 'USAF Contact Phase 曲技飛行シリーズ。',
    modules: CP_PHASES.map((phase) => ({
      id: phase.id,
      title: phase.title,
      source: {
        kind: 'series_prefix' as const,
        series: 'USAF-Contact-Phase',
        idPrefix: phase.prefix,
      },
    })),
  },
  {
    id: 'fn',
    title: 'FN（編隊飛行）',
    audience: 'USAF',
    description: 'USAF Formation Flying シリーズ。',
    modules: [
      {
        id: 'fn-formation',
        title: '編隊飛行',
        source: { kind: 'series', series: 'USAF-Formation-Flying' },
      },
    ],
  },
  {
    id: 'mentality',
    title: 'メンタリティ',
    audience: 'Pilot mindset',
    description: '訓練作法・思考法・習慣づくりの記事シリーズ。',
    modules: MENTALITY_SERIES.map((series) => ({
      id: `mentality-${series}`,
      title: series,
      source: { kind: 'series' as const, series },
    })),
  },
];

export function getCourseById(courseId: string): CourseDef | undefined {
  return COURSES.find((course) => course.id === courseId);
}
