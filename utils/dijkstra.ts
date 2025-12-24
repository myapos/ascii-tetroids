interface Graph {
  [key: string]: { [key: string]: number };
}

interface Distances {
  [key: string]: number;
}

interface PreviousNodes {
  [key: string]: string | null;
}

function dijkstra(
  graph: Graph,
  startNode: string,
  endNode: string
): { distance: number; path: string[] } {
  const distances: Distances = {};
  const previousNodes: PreviousNodes = {};
  const unvisitedNodes: Set<string> = new Set(Object.keys(graph));

  // Initialize distances and previous nodes
  for (const node in graph) {
    distances[node] = Infinity;
    previousNodes[node] = null;
  }
  distances[startNode] = 0;

  while (unvisitedNodes.size > 0) {
    // Find the node with the smallest distance
    let currentNode: string | null = null;
    for (const node of unvisitedNodes) {
      if (currentNode === null || distances[node] < distances[currentNode]) {
        currentNode = node;
      }
    }

    if (currentNode === null) {
      break;
    }

    // If the smallest distance is infinity, we are done
    if (distances[currentNode] === Infinity) {
      break;
    }

    // Remove the current node from unvisited nodes
    unvisitedNodes.delete(currentNode);

    // Update distances and previous nodes for neighbors
    for (const neighbor in graph[currentNode]) {
      const distance = distances[currentNode] + graph[currentNode][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
        previousNodes[neighbor] = currentNode;
      }
    }
  }

  // Build the shortest path
  const path: string[] = [];
  let currentNode: string | null = endNode;
  while (currentNode !== null) {
    path.unshift(currentNode);
    currentNode = previousNodes[currentNode];
  }

  return { distance: distances[endNode], path };
}

export default dijkstra;
