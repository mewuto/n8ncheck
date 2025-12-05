import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import type { GoogleDriveOperation } from '../../nodes/google-drive';
import { GoogleDriveSchemaValidator } from '../../nodes/google-drive/schema-validator';
import { DOCUMENT_OPERATIONS, GOOGLE_SHEETS_RESOURCES } from '../../nodes/google-sheets';
import { GoogleSheetsSchemaValidator } from '../../nodes/google-sheets/schema-validator';
import type { GoogleSheetsOperation } from '../../nodes/google-sheets/types';
import { GOOGLE_DRIVE_URL_PATTERNS } from '../../nodes/httprequest/apis/google-drive/constants';
import { HttpRequestSchemaValidator } from '../../nodes/httprequest/schema-validator';
import { BaseScenarioChecker } from '../shared/base-scenario-checker';
import { GOOGLE_SHEETS_SCOPE_SCENARIO_ID, PERMISSION_OPERATIONS } from './constants';
import { GoogleSheetsScopeDetectionItems } from './detection-items';

/**
 * Checks if Google Sheets creation nodes have proper scope/permission setting
 * Scenario: Google Sheets Create → Scope Setting (Google Drive Share or HTTP Request)
 */
export class GoogleSheetsScopeScenario extends BaseScenarioChecker {
  private schemaValidator: GoogleSheetsSchemaValidator;
  private googleDriveSchemaValidator: GoogleDriveSchemaValidator;
  private httpRequestSchemaValidator: HttpRequestSchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      GOOGLE_SHEETS_SCOPE_SCENARIO_ID,
      'Google Sheets Scope Scenario',
      'Checks if Google Sheets creation nodes have proper scope/permission setting',
      context
    );
    this.schemaValidator = new GoogleSheetsSchemaValidator();
    this.googleDriveSchemaValidator = new GoogleDriveSchemaValidator();
    this.httpRequestSchemaValidator = new HttpRequestSchemaValidator();
  }

  /**
   * Check if this scenario is applicable
   * Only applicable when workflow contains Google Sheets creation operations
   */
  isApplicable(context: ICheckerContext): boolean {
    const nodes = Array.from(context.nodes.values());
    return nodes.some((node) => this.isGoogleSheetsCreationNode(node));
  }

  checkScenario(): ISecurityDetectionItem[] {
    this.logger.info('Starting Google Sheets Scope scenario check');

    const detectionItems: ISecurityDetectionItem[] = [];
    const nodes = Array.from(this.nodes.values());

    // Find Google Sheets creation nodes
    const creationNodes = nodes.filter((node) => this.isGoogleSheetsCreationNode(node));

    if (creationNodes.length === 0) {
      return detectionItems;
    }

    this.log(`Detected ${creationNodes.length} Google Sheets creation node(s)`);

    for (const creationNode of creationNodes) {
      const detection = this.checkCreationNodeScope(creationNode);
      if (detection) {
        detectionItems.push(...detection);
      }
    }

    return detectionItems;
  }

  /**
   * Checks if a node is a Google Sheets creation operation using type-safe parameter mapping
   */
  private isGoogleSheetsCreationNode(node: INode): boolean {
    if (node.type !== NODE_TYPES.GOOGLE_SHEETS) {
      return false;
    }

    const parameters = node.parameters;
    if (!parameters) return false;

    // Use type-safe parameter mapping
    const mappingResult = this.schemaValidator.mapToTypedParams(parameters);
    if (!mappingResult.params) {
      return false;
    }

    const typedParams = mappingResult.params;
    return (
      typedParams.resource === GOOGLE_SHEETS_RESOURCES.DOCUMENT &&
      typedParams.operation === DOCUMENT_OPERATIONS.CREATE
    );
  }

  /**
   * Checks scope setting for a Google Sheets creation node using type-safe parameter access
   */
  private checkCreationNodeScope(creationNode: INode): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Use type-safe parameter mapping to get operation
    let operation: GoogleSheetsOperation = DOCUMENT_OPERATIONS.CREATE;
    const parameters = creationNode.parameters;
    if (parameters) {
      const mappingResult = this.schemaValidator.mapToTypedParams(parameters);
      if (mappingResult.params) {
        operation = mappingResult.params.operation;
      }
    }

    // Find subsequent nodes that could set scope
    const downstreamScopeNodes = this.getDownstreamScopeNodes(creationNode.id);

    if (downstreamScopeNodes.length === 0) {
      detectionItems.push(
        GoogleSheetsScopeDetectionItems.missingScopeAfterCreation(this.id, creationNode, operation)
      );
    } else {
      // Log that scope setting nodes were found - individual node security is handled by their respective node checkers
      this.log(
        `    ✅ Found ${downstreamScopeNodes.length} scope setting node(s) - detailed security checks will be performed by respective node checkers`
      );
    }

    return detectionItems;
  }

  /**
   * Gets downstream nodes that could set scope/permissions
   */
  private getDownstreamScopeNodes(creationNodeId: string): INode[] {
    const scopeNodes: INode[] = [];
    const allSubsequentNodeIds = this.graph.getAllSubsequentNodes(creationNodeId);

    for (const nodeId of allSubsequentNodeIds) {
      const node = this.getNodeById(nodeId);
      if (node && this.isScopeSettingNode(node)) {
        scopeNodes.push(node);
      }
    }

    return scopeNodes;
  }

  /**
   * Checks if a node is a scope/permission setting node using type-safe parameter access
   */
  private isScopeSettingNode(node: INode): boolean {
    /**
     * Google drive check
     */
    if (node.type === NODE_TYPES.GOOGLE_DRIVE) {
      const parameters = node.parameters;
      if (!parameters) return false;

      const mappingResult = this.googleDriveSchemaValidator.mapToTypedParams(parameters);
      if (!mappingResult.params) {
        // If mapping fails, fall back to unsafe access for backward compatibility
        const operation = node.parameters?.operation as GoogleDriveOperation;
        return PERMISSION_OPERATIONS.includes(operation);
      }

      const typedParams = mappingResult.params;
      return PERMISSION_OPERATIONS.includes(typedParams.operation);
    }

    /**
     * HTTP request check
     */
    if (node.type === NODE_TYPES.HTTP_REQUEST) {
      const parameters = node.parameters;
      if (!parameters) return false;

      const mappingResult = this.httpRequestSchemaValidator.mapToTypedParams(parameters);
      if (!mappingResult.params) {
        // If mapping fails, fall back to unsafe access for backward compatibility
        const url = node.parameters?.url as string;
        return GOOGLE_DRIVE_URL_PATTERNS.PERMISSIONS.test(url);
      }

      const typedParams = mappingResult.params;
      return GOOGLE_DRIVE_URL_PATTERNS.PERMISSIONS.test(typedParams.url);
    }

    return false;
  }
}
