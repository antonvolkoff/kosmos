interface Edge {
  sourceId: string;
  targetId: string;
}

const ArrowSymbol = "-->";

export default {
  id: (edge: Edge): string => `${edge.sourceId}${ArrowSymbol}${edge.targetId}`,

  parseId: (edgeId: string): Edge => {
    const [sourceId, targetId] = edgeId.split(ArrowSymbol);
    return { sourceId, targetId };
  },
};
