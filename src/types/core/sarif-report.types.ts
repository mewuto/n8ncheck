/**
 * SARIF 2.1.0 compliant types for AWS CodeCatalyst
 * Based on AWS CodeCatalyst documentation requirements
 * https://docs.aws.amazon.com/ja_jp/codecatalyst/latest/userguide/test.sarif.html#test.sarif.sarifLog
 *
 * Note: When adding new properties not in the standard SARIF spec:
 * - AWS CodeCatalyst may not recognize or display custom properties
 * - Additional properties should be added cautiously and tested for compatibility
 * - Consider using 'properties' field for custom extensions when possible
 */

export interface IISarifLog {
  $schema: 'https://www.schemastore.org/sarif-2.1.0.json';
  version: '2.1.0';
  runs: IRun[];
}

export interface IRun {
  tool: ITool;
  results: IResult[];
  graphs?: IGraph[];
}

export interface ITool {
  driver: IToolComponent;
}

export interface IToolComponent {
  name: string;
  rules: IIReportingDescriptor[];
}

export interface IIReportingDescriptor {
  id: string;
}

export interface IResult {
  ruleId: string;
  ruleIndex: number;
  level?: Level;
  message: IMessage;
  locations: ILocation[];
  properties?: IProperties;
}

export interface IMessage {
  text: string;
}

export interface ILocation {
  physicalLocation: IPhysicalLocation;
}

export interface IPhysicalLocation {
  artifactLocation: IArtifactLocation;
  region: IRegion;
}

export interface IArtifactLocation {
  uri: string;
}

export interface IRegion {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface IProperties {
  n8n: IN8nSecurityInfo;
}

export interface IN8nSecurityInfo {
  checkerId: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  relatedNodes: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  extractedValues: Record<string, unknown>;
  analysisMethod: 'static' | 'ai';
  confidence: number;
  externalConnection?: boolean;
}

export type Level = 'none' | 'note' | 'warning' | 'error';

/**
 * Alias for Level to maintain backward compatibility
 * SeverityLevel and Level represent the same severity scale
 */
export type SeverityLevel = Level;

/**
 * SARIF 2.1.0 Graph related types
 * These types represent the graph structure for workflow analysis
 */
export interface IGraph {
  description?: IMessage;
  nodes?: INode[];
  edges?: IEdge[];
}

export interface INode {
  id: string;
  label?: IMessage;
  location?: ILocation;
  children?: INode[];
  properties?: Record<string, unknown>;
}

export interface IEdge {
  id: string;
  label?: IMessage;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: Record<string, unknown>;
}
