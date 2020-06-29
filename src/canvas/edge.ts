interface Edge {
  sourceId: string;
  targetId: string;
}

export default {
  id: (edge: Edge): string => `${edge.sourceId}-->${edge.targetId}`,
};
