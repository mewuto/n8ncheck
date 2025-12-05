import type Graph from 'graphology';
import type { ISCCInfo, WorkflowGraph } from '../graph/workflow-graph';
import type {
  IEdge as SarifEdge,
  IGraph as SarifGraph,
  INode as SarifNode,
} from '../types/core/sarif-report.types';

/**
 * Converts WorkflowGraph analysis results to SARIF Graph format
 */
export class GraphConverter {
  /**
   * Convert original workflow graph to SARIF format
   */
  static convertOriginalGraph(workflowGraph: WorkflowGraph): SarifGraph {
    const graph = workflowGraph.getGraph();
    const mermaidDiagram = GraphConverter.generateMermaidDiagram(graph, 'Original Workflow');

    const nodes: SarifNode[] = [];
    const edges: SarifEdge[] = [];

    // Convert nodes
    graph.forEachNode((nodeId, attributes) => {
      nodes.push({
        id: nodeId,
        label: { text: attributes.name || nodeId },
        properties: {
          name: attributes.name,
          type: attributes.type,
          parameters: attributes.parameters,
        },
      });
    });

    // Convert edges
    graph.forEachEdge((_edgeKey, attributes, source, target) => {
      edges.push({
        id: `${source}-${target}`,
        sourceNodeId: source,
        targetNodeId: target,
        properties: {
          outputIndex: attributes.outputIndex || 0,
          inputIndex: attributes.inputIndex || 0,
        },
      });
    });

    return {
      description: { text: `Original Workflow Graph\n\n\`\`\`mermaid\n${mermaidDiagram}\n\`\`\`` },
      nodes,
      edges,
    };
  }

  /**
   * Convert condensed DAG to SARIF format
   */
  static convertCondensedDAG(workflowGraph: WorkflowGraph): SarifGraph {
    const condensedDAG = workflowGraph.getCondensedDAG();
    const sccs = workflowGraph.getSCCs();
    const mermaidDiagram = GraphConverter.generateCondensedMermaidDiagram(condensedDAG, sccs);

    const nodes: SarifNode[] = [];
    const edges: SarifEdge[] = [];

    // Convert SCC nodes
    condensedDAG.forEachNode((sccId, attributes) => {
      const scc = sccs.find((s) => s.id === sccId);
      const isLoop = scc?.type === 'loop';

      nodes.push({
        id: sccId,
        label: { text: `${sccId} (${attributes.nodeCount} nodes)${isLoop ? ' [LOOP]' : ''}` },
        properties: {
          type: attributes.type,
          originalNodes: attributes.originalNodes,
          nodeCount: attributes.nodeCount,
          isLoop: isLoop,
          sccInfo: scc,
        },
      });
    });

    // Convert edges between SCCs
    condensedDAG.forEachEdge((_edgeKey, _attributes, source, target) => {
      edges.push({
        id: `${source}-${target}`,
        sourceNodeId: source,
        targetNodeId: target,
        properties: {
          type: 'scc-dependency',
        },
      });
    });

    return {
      description: {
        text: `Condensed DAG (SCC Analysis)\n\n\`\`\`mermaid\n${mermaidDiagram}\n\`\`\``,
      },
      nodes,
      edges,
    };
  }

  /**
   * Create loop analysis graph
   */
  static convertLoopAnalysis(workflowGraph: WorkflowGraph): SarifGraph {
    const loops = workflowGraph.getLoopInfo();
    const mermaidDiagram = GraphConverter.generateLoopMermaidDiagram(loops);

    const nodes: SarifNode[] = [];
    const edges: SarifEdge[] = [];

    loops.forEach((loop) => {
      // Add nodes in loop
      loop.nodes.forEach((nodeId) => {
        nodes.push({
          id: `${loop.id}-${nodeId}`,
          label: { text: nodeId },
          properties: {
            loopId: loop.id,
            originalNodeId: nodeId,
            isInLoop: true,
          },
        });
      });

      // Add edges in loop
      loop.edges.forEach((edge) => {
        edges.push({
          id: `${loop.id}-${edge.from}-${edge.to}`,
          sourceNodeId: `${loop.id}-${edge.from}`,
          targetNodeId: `${loop.id}-${edge.to}`,
          properties: {
            loopId: loop.id,
            isLoopEdge: true,
          },
        });
      });
    });

    return {
      description: { text: `Loop Analysis\n\n\`\`\`mermaid\n${mermaidDiagram}\n\`\`\`` },
      nodes,
      edges,
    };
  }

  /**
   * Generate Mermaid diagram for original workflow
   */
  private static generateMermaidDiagram(graph: Graph, title: string): string {
    let mermaid = `graph TD\n`;
    mermaid += `    subgraph "${title}"\n`;

    graph.forEachEdge((_edge, _attrs, source, target) => {
      const sourceName = graph.getNodeAttribute(source, 'name') || source;
      const targetName = graph.getNodeAttribute(target, 'name') || target;
      mermaid += `        ${source}["${sourceName}"] --> ${target}["${targetName}"]\n`;
    });

    mermaid += `    end\n`;
    return mermaid;
  }

  /**
   * Generate Mermaid diagram for condensed DAG
   */
  private static generateCondensedMermaidDiagram(condensedDAG: Graph, sccs: ISCCInfo[]): string {
    let mermaid = `graph TD\n`;
    mermaid += `    subgraph "Condensed DAG (SCC Analysis)"\n`;

    condensedDAG.forEachEdge((_edge, _attrs, source, target) => {
      const sourceSCC = sccs.find((s) => s.id === source);
      const targetSCC = sccs.find((s) => s.id === target);

      const sourceStyle = sourceSCC?.type === 'loop' ? ' style fill:#ff9999' : '';
      const targetStyle = targetSCC?.type === 'loop' ? ' style fill:#ff9999' : '';

      mermaid += `        ${source}["${source}<br/>${sourceSCC?.nodes.join(', ') || ''}"] --> ${target}["${target}<br/>${targetSCC?.nodes.join(', ') || ''}"]\n`;

      if (sourceStyle) mermaid += `        ${sourceStyle}\n`;
      if (targetStyle) mermaid += `        ${targetStyle}\n`;
    });

    mermaid += `    end\n`;
    return mermaid;
  }

  /**
   * Generate Mermaid diagram for loop analysis
   */
  private static generateLoopMermaidDiagram(
    loops: Array<{
      id: string;
      nodes: string[];
      edges: Array<{ from: string; to: string }>;
    }>
  ): string {
    let mermaid = `graph TD\n`;

    loops.forEach((loop) => {
      mermaid += `    subgraph "${loop.id}"\n`;

      loop.edges.forEach((edge) => {
        mermaid += `        ${edge.from} --> ${edge.to}\n`;
      });

      // Highlight loop nodes
      loop.nodes.forEach((node) => {
        mermaid += `        style ${node} fill:#ff9999,stroke:#ff0000,stroke-width:2px\n`;
      });

      mermaid += `    end\n`;
    });

    return mermaid;
  }
}
