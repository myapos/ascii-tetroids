import { type Graph } from "utils/types";

const graphToGraphViz = (graph: Graph): string => {
  let result = "digraph G {\n";
  for (const [node, edges] of graph.entries()) {
    for (const edge of edges) {
      result += `  "${node}" -> "${edge}";\n`;
    }
  }
  result += "}\n";
  return result;
};
export default graphToGraphViz;
