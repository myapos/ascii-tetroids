import { type Graph } from "utils/types";

const printGraph = (graph: Graph) => {
  for (const [node, edges] of graph.entries()) {
    console.log(`${node} -> [${edges.join(", ")}]`);
  }
};

export default printGraph;
