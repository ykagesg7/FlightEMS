import type {
  SpiralLmsNode,
  SpiralLmsNodeContentRow,
  SpiralLmsNodeRow,
  SpiralLmsRecordAttemptResponse,
  SpiralLmsUserProgress,
  SpiralLmsUserProgressRow,
} from '../types/spiralLms';
import type {
  SpiralMiniQuizAnswerPayload,
  SpiralMiniQuizQuestionRow,
  SpiralMiniQuizSubmitResponse,
} from '../types/spiralLmsMiniQuiz';
import { classifySpiralLmsRecordAttemptError } from './spiralLmsRecordAttemptError';
import { isSpiralNodeOpensAtLocked } from './spiralLmsOpensAt';
import { spiralLmsSupabase } from './spiralLmsSupabase';

function enrichNode(
  row: SpiralLmsNodeRow,
  prerequisites: string[],
  contents: SpiralLmsNodeContentRow[],
  now: Date,
): SpiralLmsNode {
  return {
    ...row,
    opensAtLocked: isSpiralNodeOpensAtLocked(row.opens_at, now),
    prerequisites,
    contents: [...contents].sort((a, b) => a.sort_order - b.sort_order),
  };
}

function enrichProgressRow(
  row: SpiralLmsUserProgressRow,
  opensAt: string | null | undefined,
  now: Date,
): SpiralLmsUserProgress {
  const opensAtLocked = isSpiralNodeOpensAtLocked(opensAt, now);
  return {
    ...row,
    opensAtLocked,
    effectiveStatus: row.status,
  };
}

export async function fetchSpiralLmsNodes(now: Date = new Date()): Promise<SpiralLmsNode[]> {
  const { data: nodes, error: nodesError } = await spiralLmsSupabase
    .from('nodes')
    .select(
      'id, title, quadrant, z_level, sort_order, passing_score, unlock_config, is_published, opens_at, created_at, updated_at',
    )
    .order('z_level', { ascending: true })
    .order('quadrant', { ascending: true })
    .order('sort_order', { ascending: true });

  if (nodesError) {
    throw new Error(nodesError.message);
  }

  const { data: prereqs, error: prereqError } = await spiralLmsSupabase
    .from('node_prerequisites')
    .select('node_id, prerequisite_node_id');

  if (prereqError) {
    throw new Error(prereqError.message);
  }

  const { data: contents, error: contentsError } = await spiralLmsSupabase
    .from('node_contents')
    .select('node_id, content_slug, content_type, is_required, sort_order');

  if (contentsError) {
    throw new Error(contentsError.message);
  }

  const prereqByNode = new Map<string, string[]>();
  for (const row of prereqs ?? []) {
    const list = prereqByNode.get(row.node_id) ?? [];
    list.push(row.prerequisite_node_id);
    prereqByNode.set(row.node_id, list);
  }

  const contentsByNode = new Map<string, SpiralLmsNodeContentRow[]>();
  for (const row of contents ?? []) {
    const list = contentsByNode.get(row.node_id) ?? [];
    list.push(row);
    contentsByNode.set(row.node_id, list);
  }

  return (nodes ?? []).map((row) =>
    enrichNode(row, prereqByNode.get(row.id) ?? [], contentsByNode.get(row.id) ?? [], now),
  );
}

export async function fetchSpiralLmsUserProgress(
  userId: string,
  opensAtByNodeId: Record<string, string | null | undefined>,
  now: Date = new Date(),
): Promise<Record<string, SpiralLmsUserProgress>> {
  const { data, error } = await spiralLmsSupabase
    .from('user_progress')
    .select(
      'user_id, node_id, status, attempts, last_attempt_at, mastered_at, updated_at',
    )
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  const map: Record<string, SpiralLmsUserProgress> = {};
  for (const row of data ?? []) {
    map[row.node_id] = enrichProgressRow(row, opensAtByNodeId[row.node_id], now);
  }
  return map;
}

export async function fetchNodeMiniQuizQuestions(
  nodeId: string,
): Promise<SpiralMiniQuizQuestionRow[]> {
  const { data, error } = await spiralLmsSupabase.rpc('get_node_mini_quiz_questions', {
    p_node_id: nodeId,
  });

  if (error) {
    throw classifySpiralLmsRecordAttemptError(new Error(error.message));
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data as SpiralMiniQuizQuestionRow[];
}

export async function callSubmitMiniQuiz(params: {
  nodeId: string;
  clientAttemptId: string;
  answers: SpiralMiniQuizAnswerPayload[];
}): Promise<SpiralMiniQuizSubmitResponse> {
  const { data, error } = await spiralLmsSupabase.rpc('submit_mini_quiz', {
    p_node_id: params.nodeId,
    p_client_attempt_id: params.clientAttemptId,
    p_answers: params.answers,
  });

  if (error) {
    throw classifySpiralLmsRecordAttemptError(new Error(error.message));
  }

  if (!data || typeof data !== 'object') {
    throw classifySpiralLmsRecordAttemptError(new Error('empty submit_mini_quiz response'));
  }

  return data as SpiralMiniQuizSubmitResponse;
}

export async function callRecordAttempt(params: {
  nodeId: string;
  clientAttemptId: string;
  contentSlug: string;
}): Promise<SpiralLmsRecordAttemptResponse> {
  const { data, error } = await spiralLmsSupabase.rpc('record_attempt', {
    p_node_id: params.nodeId,
    p_attempt_kind: 'content_view',
    p_client_attempt_id: params.clientAttemptId,
    p_content_slug: params.contentSlug,
    p_score: 100,
  });

  if (error) {
    throw classifySpiralLmsRecordAttemptError(new Error(error.message));
  }

  if (!data || typeof data !== 'object') {
    throw classifySpiralLmsRecordAttemptError(new Error('empty record_attempt response'));
  }

  return data as SpiralLmsRecordAttemptResponse;
}
