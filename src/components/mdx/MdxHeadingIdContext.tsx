import { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';
import { extractPlainTextFromReactChildren, resolveMdxHeadingId } from '@/utils/mdxHeadingAnchors';

type OrdinalState = { ordinal: number; existingIds: Set<string> };

const MdxHeadingIdContext = createContext<{
  resolveHeadingId: (propsId: string | undefined, children: ReactNode) => string | undefined;
} | null>(null);

export function MdxHeadingIdProvider({
  children,
}: {
  children: ReactNode;
  /** Reserved for article identity; ordinals reset each render regardless. */
  resetKey?: string;
}) {
  const ordinalStateRef = useRef<OrdinalState>({ ordinal: 0, existingIds: new Set() });

  // Recompute stable heading-N ids on every render pass (parent re-renders must not drift ordinals).
  ordinalStateRef.current = { ordinal: 0, existingIds: new Set() };

  const resolveHeadingId = (propsId: string | undefined, childNodes: ReactNode) => {
    const text = extractPlainTextFromReactChildren(childNodes);
    return resolveMdxHeadingId(propsId, text, ordinalStateRef.current);
  };

  return (
    <MdxHeadingIdContext.Provider value={{ resolveHeadingId }}>
      {children}
    </MdxHeadingIdContext.Provider>
  );
}

export function useMdxHeadingId(props: { id?: string; children?: ReactNode }): string | undefined {
  const ctx = useContext(MdxHeadingIdContext);
  if (!ctx) {
    return props.id;
  }
  return ctx.resolveHeadingId(props.id, props.children);
}