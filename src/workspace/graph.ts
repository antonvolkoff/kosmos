export interface Graph {
  edges: {
    [id: string]: string[];
  },
  nodes: {},
  addNode(value: any, key?: string): string;
  addEdge(source: string, target: string): void;
  deleteNode(id: string): void;
  deleteEdge(sourceId: string, targetId: string): void;
  inNeighbors(id: string): string[];
  outNeighbors(id: string): string[];
  rootNodes(): string[];
}

export function createGraph(): Graph {
  let idIterator = -1;

  return {
    edges: {},
    nodes: {},

    addNode(value, key = null): string {
      if (key === null) {
        idIterator += 1;
        key = idIterator.toString();
      }

      this.nodes[key] = value;
      this.edges[key] = [];
      return key;
    },

    addEdge(source, target) {
      this.edges[source].push(target);
    },

    deleteNode(id) {
      delete this.nodes[id];
      delete this.edges[id];

      Object.keys(this.edges).forEach(sourceId => {
        this.deleteEdge(sourceId, id);
      });
    },

    deleteEdge(sourceId, targetId) {
      this.edges[sourceId] = this.edges[sourceId].filter(id => id !== targetId);
    },

    inNeighbors(id: string) {
      return Object.keys(this.edges).filter(parentId => {
        return this.edges[parentId].includes(id);
      });
    },

    outNeighbors(id: string) {
      return this.edges[id];
    },

    rootNodes(): string[] {
      return Object.keys(this.nodes).filter(id => {
        return this.inNeighbors(id).length === 0;
      });
    }
  }
}
