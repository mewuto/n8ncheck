import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import { SECURITY_CONFIG } from '../../constants/security-rules';
import type { ISlackExtractedValues } from '../../core/extracted-values.types';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { BaseScenarioChecker } from '../shared/base-scenario-checker';
import { ALLOWED_EXTERNAL_CONNECTION_NODES } from './constants';
import { SlackUserValidationDetectionItems } from './detection-items';
import { IfNodeUserValidator } from './validators/if-node-validator';
import { JSCodeUserValidator } from './validators/jscode-validator';

/**
 * Scenario checker for Slack user validation
 * Ensures proper user authentication and authorization in Slack-triggered workflows
 * Uses AST-based analysis for more accurate detection of validation patterns
 */
export class SlackUserValidationScenario extends BaseScenarioChecker<ISlackExtractedValues> {
  private jsCodeValidator: JSCodeUserValidator;
  private ifNodeValidator: IfNodeUserValidator;

  constructor(context: ICheckerContext) {
    super(
      'slack-user-validation',
      'Slack User Validation',
      'Checks for proper user validation in Slack-triggered workflows using AST analysis',
      context
    );
    this.jsCodeValidator = new JSCodeUserValidator();
    this.ifNodeValidator = new IfNodeUserValidator();
  }

  /**
   * Check if this scenario is applicable
   * Only applicable when workflow contains Slack Trigger nodes
   */
  isApplicable(context: ICheckerContext): boolean {
    const nodes = Array.from(context.nodes.values());
    return nodes.some((node) => node.type === NODE_TYPES.SLACK_TRIGGER);
  }

  checkScenario(): ISecurityDetectionItem<ISlackExtractedValues>[] {
    const detectionItems: ISecurityDetectionItem<ISlackExtractedValues>[] = [];
    const slackTriggers = Array.from(this.nodes.values()).filter(
      (node) => node.type === NODE_TYPES.SLACK_TRIGGER
    );

    if (slackTriggers.length === 0) {
      return detectionItems;
    }

    for (const slackTrigger of slackTriggers) {
      const validationResult = this.checkTriggerValidation(slackTrigger.id);
      if (validationResult) {
        detectionItems.push(validationResult);
      }
    }

    return detectionItems;
  }

  private checkTriggerValidation(
    slackTriggerId: string
  ): ISecurityDetectionItem<ISlackExtractedValues> | null {
    const slackTrigger = this.getNodeById(slackTriggerId);
    if (!slackTrigger) {
      return null;
    }

    // Find validation nodes in the workflow and construct detection item
    const detectionItem = this.findValidationInWorkflow(slackTriggerId);

    if (!detectionItem) {
      return SlackUserValidationDetectionItems.missingValidationNode(this.id, slackTrigger, []);
    }

    return detectionItem;
  }

  /**
   * Find validation nodes in the workflow and construct appropriate detection item
   */
  private findValidationInWorkflow(
    slackTriggerId: string
  ): ISecurityDetectionItem<ISlackExtractedValues> | null {
    // Get all downstream nodes from trigger
    const allDownstreamNodes = this.getAllDownstreamNodes(slackTriggerId);

    // Find Code nodes and If nodes separately
    const codeNodes = allDownstreamNodes.filter((node) => node.type === NODE_TYPES.CODE);
    const ifNodes = allDownstreamNodes.filter((node) => node.type === NODE_TYPES.IF);

    const slackTrigger = this.getNodeById(slackTriggerId);
    if (!slackTrigger) {
      return null;
    }

    // Check JSCode nodes first
    for (const codeNode of codeNodes) {
      const pathToNode = this.graph.getPathFromNodeToNode(slackTriggerId, codeNode.id);
      const pathValid = this.isPathValid(pathToNode);
      const validationResult = this.jsCodeValidator.analyzeCodeNode(codeNode);

      if (!validationResult.details.hasValidation) {
        continue;
      }

      if (pathValid) {
        this.log(`✅ ${slackTrigger.name} - User validation implemented in Code node`);
        return SlackUserValidationDetectionItems.validJSCodeValidation(
          this.id,
          slackTrigger,
          codeNode,
          validationResult.details,
          validationResult.confidence
        );
      } else {
        this.log(`❌ ${slackTrigger.name} - Invalid external connections in path to validation`);
        const externalNodes = this.getExternalNodesInPath(pathToNode);
        return SlackUserValidationDetectionItems.invalidExternalConnections(
          this.id,
          slackTrigger,
          codeNode,
          externalNodes,
          validationResult.confidence
        );
      }
    }

    // Check If nodes
    for (const ifNode of ifNodes) {
      const pathToNode = this.graph.getPathFromNodeToNode(slackTriggerId, ifNode.id);
      const pathValid = this.isPathValid(pathToNode);
      const ifValidationResult = this.ifNodeValidator.analyzeIfNode(ifNode);

      if (!ifValidationResult.isValid) {
        continue;
      }

      if (pathValid) {
        this.log(`✅ ${slackTrigger.name} - User validation implemented in If node`);
        return SlackUserValidationDetectionItems.validIfValidation(
          this.id,
          slackTrigger,
          ifNode,
          ifValidationResult.details
        );
      } else {
        this.log(`❌ ${slackTrigger.name} - Invalid external connections in path to validation`);
        const externalNodes = this.getExternalNodesInPath(pathToNode);
        return SlackUserValidationDetectionItems.invalidExternalConnections(
          this.id,
          slackTrigger,
          ifNode,
          externalNodes,
          1.0
        );
      }
    }

    // Second-level check: Look for partial configuration in JSCode nodes
    // This runs only when no complete validation was found in the first-level checks above
    if (codeNodes.length > 0) {
      const codeNode = codeNodes[0];
      const validationResult = this.jsCodeValidator.analyzeCodeNode(codeNode);

      // Count how many validation elements are partially configured
      const partialConfigCount = [
        validationResult.details.hasUserIdExtraction,
        validationResult.details.hasAuthorizationList,
        validationResult.details.hasValidationLogic,
        validationResult.details.hasErrorHandling,
      ].filter(Boolean).length;

      // If 2 or more elements are configured, treat as misconfiguration that needs fixing
      if (partialConfigCount >= 2) {
        this.log(`❌ ${slackTrigger.name} → ${codeNode.name} (Partial configuration detected)`);
        return SlackUserValidationDetectionItems.incompleteJSCodeValidation(
          this.id,
          slackTrigger,
          codeNode,
          validationResult.details,
          validationResult.confidence
        );
      }
    }

    // Final fallback: Recommend If node as best practice
    // This runs when no complete validation and no significant partial configuration was found
    this.log(`❌ ${slackTrigger.name} - Recommending If node for user validation`);
    return SlackUserValidationDetectionItems.incompleteIfValidation(this.id, slackTrigger);
  }

  /**
   * Check if the path contains only allowed external connection nodes
   */
  private isPathValid(pathNodes: INode[]): boolean {
    for (const node of pathNodes) {
      if (this.hasExternalConnection(node.type) && !this.isAllowedExternalNode(node.type)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a node type has external connection
   */
  private hasExternalConnection(nodeType: string): boolean {
    const nodeInfo = SECURITY_CONFIG.reviewRequiredNodes.find((n) => n.type === nodeType);
    return nodeInfo?.externalConnection ?? false;
  }

  /**
   * Check if a node type is in the allowed external connection list
   */
  private isAllowedExternalNode(nodeType: string): boolean {
    return ALLOWED_EXTERNAL_CONNECTION_NODES.includes(nodeType);
  }

  /**
   * Get external nodes that are not allowed in the path
   */
  private getExternalNodesInPath(pathNodes: INode[]): INode[] {
    return pathNodes.filter(
      (node) => this.hasExternalConnection(node.type) && !this.isAllowedExternalNode(node.type)
    );
  }
}
