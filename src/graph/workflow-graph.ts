import Graph from 'graphology';
import { stronglyConnectedComponents } from 'graphology-components';
import { hasCycle, topologicalSort } from 'graphology-dag';
import type { IConnection, IConnections, INode } from 'n8n-workflow';

export interface ISCCInfo {
  id: string;
  nodes: string[];
  type: 'single' | 'loop';
  hasBackEdge: boolean;
}

export interface ICondensedNode {
  sccId: string;
  originalNodes: string[];
}

export class WorkflowGraph {
  private graph: Graph;
  private sccs: ISCCInfo[] = [];
  private condensedDAG: Graph | null = null;

  constructor(nodes: INode[], connections: IConnections) {
    this.graph = new Graph({ type: 'directed', allowSelfLoops: true });

    // Initialize cache
    this.sccs = [];
    this.condensedDAG = null;

    // Build graph
    this.graph.clear();
    const nodeMapping = this.createNodeMapping(nodes);
    this.addConnections(connections, nodeMapping);

    // Compute analysis
    this.sccs = this._findSCCs();
    this.condensedDAG = this._createCondensedDAG(this.sccs);
  }

  /**
   * Create node mapping and add nodes to graph
   * @param nodes - Array of workflow nodes
   * @returns Map from node name to node ID for lookup
   *
   * Purpose: n8n connections can reference nodes by either ID or name,
   * so we need a mapping to resolve names to IDs when building edges
   */
  private createNodeMapping(nodes: INode[]): Map<string, string> {
    const nameToId = new Map<string, string>();

    nodes.forEach((node) => {
      if (node.id) {
        this.graph.addNode(node.id, {
          name: node.name,
          type: node.type,
          parameters: node.parameters,
        });
        nameToId.set(node.name, node.id);
      }
    });

    return nameToId;
  }

  /**
   * Add all connections from n8n workflow to the graph
   * @param connections - n8n workflow connections object
   * @param nameToId - Map to resolve node names to IDs
   *
   * Purpose: Process each source node and its outgoing connections,
   * converting n8n connection format to graph edges
   */
  private addConnections(connections: IConnections, nameToId: Map<string, string>): void {
    Object.entries(connections).forEach(([sourceKey, nodeOutputs]) => {
      const sourceNodeId = this.getActualNodeId(sourceKey, nameToId);

      if (!nodeOutputs.main) {
        return;
      }

      nodeOutputs.main.forEach(
        (targetConnections: IConnection[] | null, sourcePortIndex: number) => {
          this.createGraphEdges(sourceNodeId, targetConnections, sourcePortIndex, nameToId);
        }
      );
    });
  }

  /**
   * Convert node key (name or ID) to actual node ID
   * @param nodeKey - Either a node ID or node name from connections
   * @param nameToId - Map to resolve node names to IDs
   * @returns The actual node ID
   *
   * Purpose: n8n connections can reference nodes by ID or name.
   * This method normalizes both to the actual node ID.
   * Example: "HTTP Request" (name) → "abc123def" (ID)
   */
  private getActualNodeId(nodeKey: string, nameToId: Map<string, string>): string {
    if (this.graph.hasNode(nodeKey)) {
      return nodeKey;
    }

    const idFromName = nameToId.get(nodeKey);
    if (idFromName) {
      return idFromName;
    }

    throw new Error(`Node not found: ${nodeKey}`);
  }

  /**
   * Create graph edges from output port connections
   * @param sourceNodeId - Source node ID that data flows FROM
   * @param targetConnections - Array of target connections for this output port
   * @param sourcePortIndex - Which source output port (0, 1, 2, etc.)
   * @param nameToId - Map to resolve node names to IDs
   *
   * Purpose: Creates directed edges in the graph for each connection.
   * Converts n8n connection format to actual graph edges.
   * Example: Node A output[0] → [Node B, Node C, Node D] creates 3 edges
   */
  private createGraphEdges(
    sourceNodeId: string,
    targetConnections: IConnection[] | null,
    sourcePortIndex: number,
    nameToId: Map<string, string>
  ): void {
    if (!Array.isArray(targetConnections)) {
      return;
    }

    targetConnections.forEach((connection) => {
      if (!connection?.node) {
        return;
      }

      const targetNodeId = this.getActualNodeId(connection.node, nameToId);
      this.graph.addDirectedEdge(sourceNodeId, targetNodeId, {
        outputIndex: sourcePortIndex,
        inputIndex: connection.index || 0,
      });
    });
  }

  /**
   * Find strongly connected components (SCCs) using Tarjan's algorithm
   *
   * SCC (Strongly Connected Component) = A group of nodes where each node is reachable from every other node
   *
   * Why we need SCCs:
   * 1. Loop Detection: SCCs with multiple nodes or back edges are loops
   * 2. DAG Construction: We can create a DAG by treating each SCC as a single node (Condensed DAG)
   * 3. Execution Order: Topological sort works only on DAGs, so we need to condense loops first
   *
   * Example:
   *   Original Graph:    A → B ⇄ C → D
   *   SCCs:             [A], [B,C], [D]  ← B,C form a loop
   *   Condensed DAG:    SCC_A → SCC_BC → SCC_D  ← Now it's a DAG!
   */
  private _findSCCs(): ISCCInfo[] {
    const components = stronglyConnectedComponents(this.graph);

    return components.map((component, index) => {
      const hasBackEdge = this.hasBackEdgeInComponent(component);

      return {
        id: `SCC_${index}`,
        nodes: component,
        type: component.length > 1 || hasBackEdge ? 'loop' : 'single',
        hasBackEdge,
      };
    });
  }

  /**
   * Check if a component has a back edge (self-loop or cycle)
   */
  private hasBackEdgeInComponent(nodes: string[]): boolean {
    const nodeSet = new Set(nodes);

    for (const node of nodes) {
      // Check for self-loop
      if (this.graph.hasDirectedEdge(node, node)) {
        return true;
      }

      // Check for edges within the component
      for (const neighbor of this.graph.outNeighbors(node)) {
        if (nodeSet.has(neighbor)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Create condensed DAG from SCCs
   *
   * Condensed DAG = A DAG where each SCC becomes a single node
   *
   * Purpose:
   * - Even if the original graph has loops, the condensed DAG is ALWAYS acyclic
   * - This allows us to use topological sort to determine execution order
   * - Loops within an SCC are handled separately (e.g., loop unrolling)
   *
   * Transformation:
   *   Original:      A → [B ⇄ C] → D    (has cycle between B and C)
   *   Condensed:     SCC_A → SCC_BC → SCC_D    (no cycles!)
   */
  private _createCondensedDAG(sccs: ISCCInfo[]): Graph {
    // Create new graph for condensed DAG
    const condensedDAG = new Graph({ type: 'directed', allowSelfLoops: false });

    // Create SCC ID mapping
    const nodeToSCC = new Map<string, string>();
    sccs.forEach((scc) => {
      scc.nodes.forEach((node) => {
        nodeToSCC.set(node, scc.id);
      });
    });

    // Add SCC nodes to condensed graph
    sccs.forEach((scc) => {
      condensedDAG.addNode(scc.id, {
        type: scc.type,
        originalNodes: scc.nodes,
        nodeCount: scc.nodes.length,
      });
    });

    // Add edges between SCCs
    const addedEdges = new Set<string>();

    this.graph.forEachEdge((_edge, _attrs, source, target) => {
      const sourceSCC = nodeToSCC.get(source);
      const targetSCC = nodeToSCC.get(target);

      if (sourceSCC && targetSCC && sourceSCC !== targetSCC) {
        const edgeKey = `${sourceSCC}->${targetSCC}`;
        if (!addedEdges.has(edgeKey)) {
          condensedDAG.addDirectedEdge(sourceSCC, targetSCC);
          addedEdges.add(edgeKey);
        }
      }
    });

    return condensedDAG;
  }

  /**
   * Get strongly connected components
   */
  getSCCs(): ISCCInfo[] {
    return this.sccs;
  }

  /**
   * Get condensed DAG
   */
  getCondensedDAG(): Graph {
    if (!this.condensedDAG) {
      throw new Error('Condensed DAG not initialized');
    }
    return this.condensedDAG;
  }

  /**
   * Get topological order of condensed DAG
   */
  getTopologicalOrder(): string[] {
    if (!this.condensedDAG) {
      throw new Error('Condensed DAG not initialized');
    }

    if (hasCycle(this.condensedDAG)) {
      throw new Error('Condensed graph should be acyclic but contains cycles');
    }

    return topologicalSort(this.condensedDAG);
  }

  /**
   * Get loop SCCs that need unrolling
   */
  getLoopSCCs(): ISCCInfo[] {
    return this.sccs.filter((scc) => scc.type === 'loop');
  }

  /**
   * Get execution order for nodes (respecting dependencies)
   */
  getExecutionOrder(): string[][] {
    const order = this.getTopologicalOrder();
    return order.map((sccId) => {
      const scc = this.sccs.find((s) => s.id === sccId);
      return scc ? scc.nodes : [];
    });
  }

  /**
   * Get node dependencies (upstream nodes that this node depends on)
   *
   * @example
   * // Workflow: HTTPRequest → DataTransform → SlackMessage
   * getNodeDependencies('DataTransform') // Returns: ['HTTPRequest']
   * getNodeDependencies('SlackMessage')  // Returns: ['DataTransform']
   * getNodeDependencies('HTTPRequest')   // Returns: [] (no dependencies)
   */
  getNodeDependencies(nodeId: string): string[] {
    if (!this.graph.hasNode(nodeId)) {
      return [];
    }
    return this.graph.inNeighbors(nodeId);
  }

  /**
   * Get node dependents (downstream nodes that depend on this node)
   *
   * @example
   * // Workflow: HTTPRequest → DataTransform → SlackMessage
   * getNodeDependents('HTTPRequest')   // Returns: ['DataTransform']
   * getNodeDependents('DataTransform') // Returns: ['SlackMessage']
   * getNodeDependents('SlackMessage')  // Returns: [] (no dependents)
   */
  getNodeDependents(nodeId: string): string[] {
    if (!this.graph.hasNode(nodeId)) {
      return [];
    }
    return this.graph.outNeighbors(nodeId);
  }

  /**
   * Get all subsequent nodes (all downstream nodes reachable from this node)
   *
   * @example
   * // Workflow: A → B → C → D, A → E → F
   * getAllSubsequentNodes('A')  // Returns: ['B', 'C', 'D', 'E', 'F']
   * getAllSubsequentNodes('B')  // Returns: ['C', 'D']
   * getAllSubsequentNodes('D')  // Returns: [] (no subsequent nodes)
   */
  getAllSubsequentNodes(nodeId: string): string[] {
    if (!this.graph.hasNode(nodeId)) {
      return [];
    }

    const visited = new Set<string>();
    const queue: string[] = [nodeId];
    const subsequentNodes: string[] = [];

    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (!currentNodeId) continue;

      if (visited.has(currentNodeId)) {
        continue;
      }
      visited.add(currentNodeId);

      // Skip the starting node itself
      if (currentNodeId !== nodeId) {
        subsequentNodes.push(currentNodeId);
      }

      // Add all outgoing neighbors to the queue
      const dependents = this.graph.outNeighbors(currentNodeId);
      queue.push(...dependents);
    }

    return subsequentNodes;
  }

  /**
   * Get all preceding nodes (all upstream nodes that can reach this node)
   *
   * @example
   * // Workflow: A → B → C → D, E → B
   * getAllPrecedingNodes('D')  // Returns: ['A', 'B', 'C', 'E']
   * getAllPrecedingNodes('B')  // Returns: ['A', 'E']
   * getAllPrecedingNodes('A')  // Returns: [] (no preceding nodes)
   */
  getAllPrecedingNodes(nodeId: string): string[] {
    if (!this.graph.hasNode(nodeId)) {
      return [];
    }

    const visited = new Set<string>();
    const queue: string[] = [nodeId];
    const precedingNodes: string[] = [];

    while (queue.length > 0) {
      const currentNodeId = queue.shift();
      if (!currentNodeId) continue;

      if (visited.has(currentNodeId)) {
        continue;
      }
      visited.add(currentNodeId);

      // Skip the starting node itself
      if (currentNodeId !== nodeId) {
        precedingNodes.push(currentNodeId);
      }

      // Add all incoming neighbors to the queue
      const dependencies = this.graph.inNeighbors(currentNodeId);
      queue.push(...dependencies);
    }

    return precedingNodes;
  }

  /**
   * Check if workflow has circular dependencies
   */
  hasCircularDependencies(): boolean {
    return this.sccs.some((scc) => scc.type === 'loop');
  }

  /**
   * Get detailed loop information
   */
  getLoopInfo(): Array<{
    id: string;
    nodes: string[];
    edges: Array<{ from: string; to: string }>;
  }> {
    return this.getLoopSCCs().map((scc) => {
      const edges: Array<{ from: string; to: string }> = [];
      const nodeSet = new Set(scc.nodes);

      // Find all edges within the SCC
      scc.nodes.forEach((node) => {
        this.graph.forEachOutEdge(node, (_edge, _attrs, source, target) => {
          if (nodeSet.has(target)) {
            edges.push({ from: source, to: target });
          }
        });
      });

      return {
        id: scc.id,
        nodes: scc.nodes,
        edges,
      };
    });
  }

  /**
   * Get the internal graph instance (for debugging)
   */
  getGraph(): Graph {
    return this.graph;
  }

  /**
   * Get the path from source node to target node
   * Uses BFS to find the shortest path between two nodes
   */
  getPathFromNodeToNode(sourceNodeId: string, targetNodeId: string): INode[] {
    if (!this.graph.hasNode(sourceNodeId) || !this.graph.hasNode(targetNodeId)) {
      return [];
    }

    if (sourceNodeId === targetNodeId) {
      return [this.getNodeById(sourceNodeId)].filter(Boolean) as INode[];
    }

    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [
      { nodeId: sourceNodeId, path: [sourceNodeId] },
    ];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;

      const { nodeId, path } = current;

      if (visited.has(nodeId)) {
        continue;
      }
      visited.add(nodeId);

      if (nodeId === targetNodeId) {
        // Found target, convert node IDs to node objects
        return path.map((id) => this.getNodeById(id)).filter(Boolean) as INode[];
      }

      // Add all neighbors to queue
      const neighbors = this.graph.outNeighbors(nodeId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({
            nodeId: neighbor,
            path: [...path, neighbor],
          });
        }
      }
    }

    return [];
  }

  /**
   * Get node by ID from the graph
   * Returns the full INode object with all attributes
   */
  private getNodeById(nodeId: string): INode | null {
    if (!this.graph.hasNode(nodeId)) {
      return null;
    }

    const attributes = this.graph.getNodeAttributes(nodeId);
    return {
      id: nodeId,
      name: attributes.name,
      type: attributes.type,
      parameters: attributes.parameters,
      typeVersion: 1, // Default value - could be stored in attributes if needed
      position: [0, 0], // Default value - could be stored in attributes if needed
    };
  }

  /**
   * Export graph for debugging
   */
  exportGraph(): {
    nodes: Array<{ id: string; [key: string]: unknown }>;
    edges: Array<{ source: string; target: string; [key: string]: unknown }>;
  } {
    const nodes: Array<{ id: string; [key: string]: unknown }> = [];
    const edges: Array<{ source: string; target: string; [key: string]: unknown }> = [];

    this.graph.forEachNode((node, attributes) => {
      nodes.push({ id: node, ...attributes });
    });

    this.graph.forEachEdge((_edge, attributes, source, target) => {
      edges.push({ source, target, ...attributes });
    });

    return { nodes, edges };
  }
}
