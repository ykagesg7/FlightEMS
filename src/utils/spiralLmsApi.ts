import type {
  SpiralLmsAttemptKind,
  SpiralLmsNode,
  SpiralLmsNodeContentRow,
  SpiralLmsNodePrerequisiteRow,
  SpiralLmsNodeRow,
  SpiralLmsRecordAttemptResponse,
  SpiralLmsUserProgress,
  SpiralLmsUserProgressRow,
} from '../types/spiralLms';
import { isSpiralNodeOpensAtLocked } from './spiralLmsOpensAt';
import { supabase } from './supabase';

/** Spiral LMS tables are not yet in generated `database.types` (PR ①–②). */
type SpiralLmsQueryClient = {
  from: (relation: string) => {
    select: (columns: string) => SpiralLmsSelectQuery;
  };
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

type SpiralLmsSelectQuery = {
  order: (column: string, options?: { ascending?: boolean }) => SpiralLmsSelectQuery;
  eq: (column: string, value: string) => Promise<{ data: unknown; error: { message: string } | null }>;
  then: (
    resolve: (value: { data: unknown; error: { message: string } | null }) => void,
    reject?: (reason: unknown) => void,
  ) => Promise<void>;
};

const spiralClient = supabase as unknown as SpiralLmsQueryClient;

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

function enrichProgress(
  row: SpiralLmsUserProgressRow,
  opensAt: string | null | undefined,
  now: Date,
): SpiralLmsUserProgress {
  return {
    ...row,
    opensAtLocked: isSpiralNodeOpensAtLocked(opensAt, now),
  };
}

export async function fetchSpiralLmsNodes(now: Date = new Date()): Promise<SpiralLmsNode[]> {
  const nodesResult = await spiralClient
    .from('nodes')
    .select(
      'id, title, quadrant, z_level, sort_order, passing_score, unlock_config, is_published, opens_at, created_at, updated_at',
    )
    .order('z_level', { ascending: true })
    .order('quadrant', { ascending: true })
    .order('sort_order', { ascending: true });

  const prereqResult = await spiralClient
    .from('node_prerequisites')
    .select('node_id, prerequisite_node_id');

  const contentsResult = await spiralClient
    .from('node_contents')
    .select('node_id, content_slug, content_type, is_required, sort_order');

  if (nodesResult.error) {
    throw new Error(nodesResult.error.message);
  }
  if (prereqResult.error) {
    throw new Error(prereqResult.error.message);
  }
  if (contentsResult.error) {
    throw new Error(contentsResult.error.message);
  }

  const nodes = (nodesResult.data ?? []) as SpiralLmsNodeRow[];
  const prereqs = (prereqResult.data ?? []) as SpiralLmsNodePrerequisiteRow[];
  const contents = (contentsResult.data ?? []) as SpiralLmsNodeContentRow[];

  const prereqByNode = new Map<string, string[]>();
  for (const row of prereqs) {
    const list = prereqByNode.get(row.node_id) ?? [];
    list.push(row.prerequisite_node_id);
    prereqByNode.set(row.node_id, list);
  }

  const contentsByNode = new Map<string, SpiralLmsNodeContentRow[]>();
  for (const row of contents) {
    const list = contentsByNode.get(row.node_id) ?? [];
    list.push(row);
    contentsByNode.set(row.node_id, list);
  }

  return nodes.map((row) =>
    enrichNode(row, prereqByNode.get(row.id) ?? [], contentsByNode.get(row.id) ?? [], now),
  );
}

export async function fetchSpiralLmsUserProgress(
  userId: string,
  opensAtByNodeId: Record<string, string | null | undefined>,
  now: Date = new Date(),
): Promise<Record<string, SpiralLmsUserProgress>> {
  const { data, error } = await spiralClient
    .from('user_progress')
    .select(
      'user_id, node_id, status, attempts, last_attempt_at, mastered_at, updated_at',
    )
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SpiralLmsUserProgressRow[];
  const map: Record<string, SpiralLmsUserProgress> = {};
  for (const row of rows) {
    map[row.node_id] = enrichProgress(row, opensAtByNodeId[row.node_id], now);
  }
  return map;
}

export async function callRecordAttempt(params: {
  nodeId: string;
  attemptKind: SpiralLmsAttemptKind;
  clientAttemptId: string;
  contentSlug?: string | null;
  score?: number | null;
}): Promise<SpiralLmsRecordAttemptResponse> {
  const { data, error } = await spiralClient.rpc('record_attempt', {
    p_node_id: params.nodeId,
    p_attempt_kind: params.attemptKind,
    p_client_attempt_id: params.clientAttemptId,
    p_content_slug: params.contentSlug ?? null,
    p_score: params.score ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as SpiralLmsRecordAttemptResponse;
}
