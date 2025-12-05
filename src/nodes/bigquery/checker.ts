import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import { containsProdString, hasDynamicConstruction } from '../../core/content-analyzer';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { extractResourceValue } from '../../utils/resource-locator';
import { BaseNodeChecker } from '../shared/base-node-checker';
import { BIGQUERY_CHECKER_ID } from './constants';
import { BigQueryDetectionItems } from './detection-items';
import { BigQuerySchemaValidator } from './schema-validator';
import type {
  IBigQueryExecuteQueryParameters,
  IBigQueryExtractedValues,
  IBigQueryInsertParameters,
  IBigQueryTypedParameters,
} from './types';

/**
 * Security checker for BigQuery nodes
 * Uses typed parameter mapping and schema validation for comprehensive security checks
 */
export class BigQueryChecker extends BaseNodeChecker<IBigQueryExtractedValues> {
  private schemaValidator: BigQuerySchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      BIGQUERY_CHECKER_ID,
      'BigQuery Checker',
      'Checks BigQuery nodes for unsafe configurations',
      context
    );
    this.schemaValidator = new BigQuerySchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.GOOGLE_BIGQUERY, NODE_TYPES.GOOGLE_BIGQUERY_TOOL];
  }

  private isBigQueryNode(node: INode): boolean {
    return this.getSupportedNodeTypes().includes(node.type);
  }

  checkNode(node: INode): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
    this.logHeader(node);

    const detectionItems: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];

    // Check if node is BigQuery type
    if (!this.isBigQueryNode(node)) {
      return detectionItems;
    }

    // Get node parameters
    const params = node.parameters;
    if (!params) {
      detectionItems.push(
        BigQueryDetectionItems.configurationError(
          this.id,
          node,
          'parameters',
          COMMON_NODE_MESSAGES.PARAMETERS_NOT_CONFIGURED()
        )
      );
      return detectionItems;
    }

    // 1. Map raw parameters to strict typed parameters
    const mappingResult = this.schemaValidator.mapToTypedParams(params);

    // Handle mapping errors
    if (mappingResult.errors.length > 0 || !mappingResult.params) {
      mappingResult.errors.forEach((error) => {
        detectionItems.push(
          BigQueryDetectionItems.configurationError(
            this.id,
            node,
            error.field,
            error.message,
            extractResourceValue(mappingResult.params?.projectId)
          )
        );
      });
      return detectionItems;
    }

    const typedParams = mappingResult.params;

    // 2. Validate strict typed parameters (schema validation only)
    const validationResult = this.schemaValidator.validate(typedParams);

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
    params: IBigQueryTypedParameters
  ): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
    const detectionItems: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];

    // Categorize based on operation
    this.categorizeNode(node, params);

    // Common security checks for all operations
    detectionItems.push(...this.performCommonSecurityChecks(node, params));

    // Operation-specific security checks with type-safe guards
    if (this.isExecuteQueryParams(params)) {
      detectionItems.push(...this.performExecuteQuerySecurityChecks(node, params));
    } else if (this.isInsertParams(params)) {
      detectionItems.push(...this.performInsertSecurityChecks(node, params));
    }

    return detectionItems;
  }

  /**
   * Categorize BigQuery node based on operation
   */
  protected categorizeNode(_node: INode, params: IBigQueryTypedParameters): void {
    const SERVICE_NAME = 'googleBigQuery';

    switch (params.operation) {
      case 'executeQuery':
        this.addToCategory('dataSource', SERVICE_NAME);
        break;
      case 'insert':
        this.addToCategory('output', SERVICE_NAME);
        break;
      default:
        this.addToCategory('other', SERVICE_NAME);
    }
  }

  /**
   * Common security checks applicable to all BigQuery operations
   */
  private performCommonSecurityChecks(
    node: INode,
    params: IBigQueryTypedParameters
  ): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
    const detectionItems: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];

    const projectValue = extractResourceValue(params.projectId);

    // Always detect project environment - empty projectId will result in none severity
    detectionItems.push(
      BigQueryDetectionItems.detectProjectEnvironment(
        this.id,
        node,
        params.operation,
        projectValue // Pass empty string if undefined
      )
    );

    return detectionItems;
  }

  /**
   * Type guard to check if params is IBigQueryExecuteQueryParameters
   */
  private isExecuteQueryParams(
    params: IBigQueryTypedParameters
  ): params is IBigQueryExecuteQueryParameters {
    return params.operation === 'executeQuery';
  }

  /**
   * Type guard to check if params is IBigQueryInsertParameters
   */
  private isInsertParams(params: IBigQueryTypedParameters): params is IBigQueryInsertParameters {
    return params.operation === 'insert';
  }

  /**
   * Security checks specific to executeQuery operations
   */
  private performExecuteQuerySecurityChecks(
    node: INode,
    params: IBigQueryExecuteQueryParameters
  ): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
    const detectionItems: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];

    // Check SQL query for injection patterns (prod/dev check is done in performCommonSecurityChecks)
    const sqlQuery = params.sqlQuery;
    if (sqlQuery) {
      const projectValue = extractResourceValue(params.projectId);
      const sqlDetectionItems = this.checkSqlQuery(node, sqlQuery, projectValue);
      detectionItems.push(...sqlDetectionItems);
    }

    return detectionItems;
  }

  /**
   * Security checks specific to insert operations
   */
  private performInsertSecurityChecks(
    node: INode,
    params: IBigQueryInsertParameters
  ): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
    const detectionItems: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];

    // Note: Production project access is already checked in performCommonSecurityChecks
    // Here we only check for production dataset/table references which should be warnings

    const datasetId = extractResourceValue(params.datasetId);
    const projectValue = extractResourceValue(params.projectId);
    const tableId = extractResourceValue(params.tableId);

    // Check if either dataset or table contains production string
    if ((datasetId && containsProdString(datasetId)) || (tableId && containsProdString(tableId))) {
      detectionItems.push(
        BigQueryDetectionItems.detectProductionInsertResourceAccess(
          this.id,
          node,
          datasetId,
          tableId,
          params.operation,
          projectValue
        )
      );
    }

    return detectionItems;
  }

  /**
   * Check SQL query for security issues (used by performExecuteQuerySecurityChecks)
   */
  private checkSqlQuery(
    node: INode,
    sqlQuery: string,
    projectId?: string
  ): ISecurityDetectionItem<IBigQueryExtractedValues>[] {
    const detectionItems: ISecurityDetectionItem<IBigQueryExtractedValues>[] = [];

    // Check for production dataset/table references in SQL query
    if (containsProdString(sqlQuery)) {
      detectionItems.push(
        BigQueryDetectionItems.detectProductionSqlQuery(this.id, node, sqlQuery, projectId)
      );
    }

    // Check for dynamic query construction
    if (hasDynamicConstruction(sqlQuery)) {
      detectionItems.push(BigQueryDetectionItems.dynamicQuery(this.id, node, sqlQuery, projectId));
    }

    return detectionItems;
  }
}
