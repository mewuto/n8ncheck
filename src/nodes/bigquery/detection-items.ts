import type { INode } from 'n8n-workflow';
import { containsDevString, containsProdString } from '../../core/content-analyzer';
import {
  createSecurityDetectionItem,
  type ISecurityDetectionItem,
} from '../../core/security-detection-item';
import type { SeverityLevel } from '../../types/core/sarif-report.types';
import { createConfigurationErrorMessage, type I18nMessage } from '../../utils/i18n-messages';
import type { BigQueryOperation } from './constants';
import type { IBigQueryExtractedValues } from './types';

/**
 * Detection codes for BigQuery scenarios
 */
export const BIGQUERY_DETECTION_CODES = {
  DYNAMIC_QUERY_DETECTED: 'BQ_DYNAMIC_QUERY',
  CONFIGURATION_ERROR: 'BQ_CONFIG_ERROR',
  PROJECT_ENV_DETECTED: 'BQ_PROJECT_ENV',
  PRODUCTION_SQL_QUERY_DETECTED: 'BQ_PROD_SQL_QUERY',
  PRODUCTION_INSERT_RESOURCE_ACCESS: 'BQ_PROD_INSERT_RESOURCE',
} as const;

/**
 * BigQuery-specific SecurityDetectionItem factory functions
 *
 * These functions provide a clean, type-safe way to create SecurityDetectionItems
 * for BigQuery-related security issues without the complexity of Builder patterns.
 */
export const BigQueryDetectionItems = {
  /**
   * Create detection for dynamic query construction
   */
  dynamicQuery(
    checkerId: string,
    node: INode,
    sqlQuery: string,
    projectId?: string
  ): ISecurityDetectionItem<IBigQueryExtractedValues> {
    return createSecurityDetectionItem<IBigQueryExtractedValues>({
      checkerId,
      detectionCode: BIGQUERY_DETECTION_CODES.DYNAMIC_QUERY_DETECTED,
      severity: 'warning',
      message: {
        en: `Dynamic SQL query construction detected. Query:\n\`\`\`sql\n${sqlQuery.substring(0, 200)}${
          sqlQuery.length > 200 ? '\n...' : ''
        }\n\`\`\`\nPlease confirm if access is allowed. Use of parameterized queries is recommended.`,
        ja: `動的SQLクエリ構築が検出されました。クエリ:\n\`\`\`sql\n${sqlQuery.substring(0, 200)}${
          sqlQuery.length > 200 ? '\n...' : ''
        }\n\`\`\`\n本当にアクセスして良いか確認してください。パラメータ化クエリの使用を推奨します。`,
      },
      node,
      extractedValues: {
        projectId: projectId,
        operation: 'executeQuery',
        sqlQuery: sqlQuery.substring(0, 100),
        hasDynamicQuery: true,
      },
      analysisMethod: 'static',
      confidence: 0.8,
    });
  },

  /**
   * Create detection for configuration errors
   */
  configurationError(
    checkerId: string,
    node: INode,
    field: string | undefined,
    errorMessage: I18nMessage,
    projectId?: string,
    operation: BigQueryOperation = 'executeQuery'
  ): ISecurityDetectionItem<IBigQueryExtractedValues> {
    const message = createConfigurationErrorMessage(errorMessage, field);

    return createSecurityDetectionItem<IBigQueryExtractedValues>({
      checkerId,
      detectionCode: BIGQUERY_DETECTION_CODES.CONFIGURATION_ERROR,
      severity: 'note',
      message,
      node,
      extractedValues: {
        projectId: projectId || '',
        operation,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Detect project environment (prod/dev/other) and create appropriate security detection
   */
  detectProjectEnvironment(
    checkerId: string,
    node: INode,
    operation: BigQueryOperation,
    projectId?: string
  ): ISecurityDetectionItem<IBigQueryExtractedValues> {
    const isProduction = projectId ? containsProdString(projectId) : false;
    const isDevelopment = projectId ? containsDevString(projectId) : false;

    let severity: SeverityLevel = 'warning';
    let messageEn = 'Access detected.';
    let messageJa = 'アクセスが検出されました。';
    const detectionCode: string = BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED;

    if (!projectId || projectId === '') {
      // Empty projectId - no security concern
      severity = 'none';
      messageEn = 'Access detected with empty project ID.';
      messageJa = '空のプロジェクトIDでアクセスが検出されました。';
    } else if (isProduction) {
      // Production environment
      severity = 'warning';
      messageEn = `Production environment project \`${projectId}\` access detected. Please confirm if access is allowed.`;
      messageJa = `本番環境プロジェクト \`${projectId}\` へのアクセスが検出されました。本当にアクセスして良いか確認してください。`;
    } else if (isDevelopment) {
      severity = 'none';
      messageEn = `Development environment project \`${projectId}\` access detected.`;
      messageJa = `開発環境プロジェクト \`${projectId}\` へのアクセスが検出されました。`;
    } else {
      severity = 'warning';
      messageEn = `Project \`${projectId}\` access detected. This may be neither development nor production environment.`;
      messageJa = `プロジェクト \`${projectId}\` へのアクセスが検出されました。このプロジェクトは開発環境でも本番環境でもない可能性があります。`;
    }

    return createSecurityDetectionItem<IBigQueryExtractedValues>({
      checkerId,
      detectionCode,
      severity,
      message: {
        en: messageEn,
        ja: messageJa,
      },
      node,
      extractedValues: {
        projectId: projectId,
        operation,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Detect production dataset/table references in SQL query for executeQuery operations
   */
  detectProductionSqlQuery(
    checkerId: string,
    node: INode,
    sqlQuery: string,
    projectId?: string
  ): ISecurityDetectionItem<IBigQueryExtractedValues> {
    return createSecurityDetectionItem<IBigQueryExtractedValues>({
      checkerId,
      detectionCode: BIGQUERY_DETECTION_CODES.PRODUCTION_SQL_QUERY_DETECTED,
      severity: 'warning',
      message: {
        en: `"prod" string detected in SQL query. Possible access to production dataset or table. Query:\n\`\`\`sql\n${sqlQuery.substring(0, 200)}${
          sqlQuery.length > 200 ? '\n...' : ''
        }\n\`\`\`\nPlease confirm if access is allowed.`,
        ja: `SQLクエリ内で「prod」文字列が検出されました。本番データセットやテーブルへのアクセスの可能性があります。クエリ:\n\`\`\`sql\n${sqlQuery.substring(0, 200)}${
          sqlQuery.length > 200 ? '\n...' : ''
        }\n\`\`\`\n本当にアクセスして良いか確認してください。`,
      },
      node,
      extractedValues: {
        projectId: projectId || '',
        operation: 'executeQuery',
        sqlQuery: sqlQuery.substring(0, 200),
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },

  /**
   * Detect production resource access for INSERT operations (dataset/table)
   */
  detectProductionInsertResourceAccess(
    checkerId: string,
    node: INode,
    datasetId: string | undefined,
    tableId: string | undefined,
    operation: BigQueryOperation,
    projectId?: string
  ): ISecurityDetectionItem<IBigQueryExtractedValues> {
    const datasetPart = `dataset \`${datasetId}\``;
    const tablePart = tableId ? ` table \`${tableId}\`` : '';
    const resourceDescription = datasetPart + tablePart;

    return createSecurityDetectionItem<IBigQueryExtractedValues>({
      checkerId,
      detectionCode: BIGQUERY_DETECTION_CODES.PRODUCTION_INSERT_RESOURCE_ACCESS,
      severity: 'warning',
      message: {
        en: `Production ${resourceDescription} INSERT access detected. Please confirm if access is allowed.`,
        ja: `本番${resourceDescription}へのINSERTアクセスが検出されました。本当にアクセスして良いか確認してください。`,
      },
      node,
      extractedValues: {
        projectId: projectId || '',
        datasetId,
        tableId,
        operation,
      },
      analysisMethod: 'static',
      confidence: 1.0,
    });
  },
};
