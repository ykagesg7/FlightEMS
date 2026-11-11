const NEXT_EPISODE_IF_PREFIX = /次回は\s+IF-\d-\d\s*[：:]\s*/g;

type MdxNode = {
  type: string;
  value?: string;
  children?: MdxNode[];
};

function stripNextEpisodeIfDevCodePrefix(text: string): string {
  return text.replace(NEXT_EPISODE_IF_PREFIX, '次回は ');
}

/** Remove dev id prefix in 「次回は IF-x-y：…」 before MDX compile (on-disk MDX unchanged). */
export function remarkStripNextEpisodeIfDevCodes() {
  return (tree: MdxNode) => {
    const visit = (node: MdxNode) => {
      if (node.type === 'text' && typeof node.value === 'string') {
        node.value = stripNextEpisodeIfDevCodePrefix(node.value);
      }
      for (const child of node.children ?? []) {
        visit(child);
      }
    };
    visit(tree);
  };
}
