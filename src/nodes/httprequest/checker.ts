import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import { containsProdString, hasDynamicConstruction } from '../../core/content-analyzer';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { BaseNodeChecker } from '../shared/base-node-checker';
import { analyzeGoogleDriveHttpRequest } from './apis/google-drive';
import { GOOGLE_DRIVE_URL_PATTERNS } from './apis/google-drive/constants';
import { HTTPREQUEST_CHECKER_ID, type HttpMethod } from './constants';
import { HttpRequestDetectionItems } from './detection-items';
import { HttpRequestSchemaValidator } from './schema-validator';
import type { IHttpRequestTypedParameters } from './types';

/**
 * Security checker for HTTP Request nodes
 * Uses typed parameter mapping and schema validation for comprehensive security checks
 */
export class HttpRequestChecker extends BaseNodeChecker {
  private schemaValidator: HttpRequestSchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      HTTPREQUEST_CHECKER_ID,
      'HTTP Request Checker',
      'Checks HTTP Request nodes for unsafe configurations',
      context
    );
    this.schemaValidator = new HttpRequestSchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.HTTP_REQUEST, NODE_TYPES.HTTP_REQUEST_TOOL];
  }

  private isHttpRequestNode(node: INode): boolean {
    return this.getSupportedNodeTypes().includes(node.type);
  }

  checkNode(node: INode): ISecurityDetectionItem[] {
    this.logHeader(node);

    const detectionItems: ISecurityDetectionItem[] = [];

    // Check if node is HTTP Request type
    if (!this.isHttpRequestNode(node)) {
      return detectionItems;
    }

    // Get node parameters
    const params = node.parameters;
    if (!params) {
      detectionItems.push(
        HttpRequestDetectionItems.configurationError(
          this.id,
          node,
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detectionItems;
    }

    // 1. Map raw parameters to strict typed parameters using schema validator
    const mappingResult = this.schemaValidator.mapToTypedParams(params);

    // Handle mapping errors
    if (mappingResult.errors.length > 0 || !mappingResult.params) {
      mappingResult.errors.forEach((error) => {
        detectionItems.push(
          HttpRequestDetectionItems.configurationError(this.id, node, error.message)
        );
      });
      return detectionItems;
    }

    const typedParams = mappingResult.params;

    // 2. Validate strict typed parameters (schema validation only)
    const validationResult = this.schemaValidator.validate(params);

    // 3. Convert validation errors to security detection items
    detectionItems.push(...this.convertValidationToDetectionItems(node, validationResult));

    // 4. Additional security-specific checks with typed parameters
    detectionItems.push(...this.performSecurityChecks(node, typedParams));

    return detectionItems;
  }

  /**
   * Security checks with typed parameters for comprehensive business logic validation
   */
  private performSecurityChecks(
    node: INode,
    params: IHttpRequestTypedParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Categorize based on method
    this.categorizeNode(node, params.method);

    if (!params.url) {
      return detectionItems;
    }

    // URL-based security checks
    // 1. Check for production URL (contains "prod")
    if (containsProdString(params.url)) {
      detectionItems.push(
        HttpRequestDetectionItems.productionUrlDetected(this.id, node, params.url)
      );
    }

    // 2. Check for dynamic URL construction (n8n expressions)
    if (hasDynamicConstruction(params.url)) {
      detectionItems.push(
        HttpRequestDetectionItems.dynamicUrlConstruction(this.id, node, params.url)
      );
    }

    // 3. Check for dynamic construction in jsonBody
    if (params.jsonBody && hasDynamicConstruction(params.jsonBody)) {
      detectionItems.push(
        HttpRequestDetectionItems.dynamicBodyConstruction(this.id, node, params.jsonBody, true)
      );
    }

    // 4. Check for dynamic construction in body
    if (params.body && hasDynamicConstruction(params.body)) {
      detectionItems.push(
        HttpRequestDetectionItems.dynamicBodyConstruction(this.id, node, params.body, false)
      );
    }

    // 5. Check for Google Drive Permissions API (only if URL exists)
    if (params.url && GOOGLE_DRIVE_URL_PATTERNS.PERMISSIONS.test(params.url)) {
      const googleDriveItems = analyzeGoogleDriveHttpRequest(
        this.id,
        node,
        params.url,
        params.method,
        params.jsonBody,
        params.bodyParameters
      );
      detectionItems.push(...googleDriveItems);
    }

    return detectionItems;
  }

  /**
   * Categorize HTTP Request node based on method
   */
  protected categorizeNode(_node: INode, method?: HttpMethod): void {
    const SERVICE_NAME = 'httpRequest';

    if (!method) {
      this.addToCategory('other', SERVICE_NAME);
      return;
    }

    // Determine category based on HTTP method
    switch (method.toUpperCase()) {
      case 'GET':
      case 'HEAD':
        this.addToCategory('dataSource', SERVICE_NAME);
        break;
      case 'POST':
      case 'PUT':
      case 'PATCH':
      case 'DELETE':
        this.addToCategory('output', SERVICE_NAME);
        break;
      default:
        this.addToCategory('other', SERVICE_NAME);
    }
  }
}
