import type { INode } from 'n8n-workflow';
import { NODE_TYPES } from '../../constants/node-types';
import type { ICheckerContext } from '../../core/interfaces/checker.interface';
import type { ISecurityDetectionItem } from '../../core/security-detection-item';
import { COMMON_NODE_MESSAGES } from '../../utils/i18n-messages';
import { BaseNodeChecker } from '../shared/base-node-checker';
import {
  GOOGLE_DRIVE_CHECKER_ID,
  type GoogleDriveOperation,
  type GoogleDriveResource,
} from './constants';
import { GoogleDriveDetectionItems } from './detection-items';
import {
  isCompanyUserOrGroupRestricted,
  isDomainAccess,
  isOwnerTransfer,
  isPublicAccess,
} from './permission-utils';
import { GoogleDriveSchemaValidator } from './schema-validator';
import {
  isDataSourceOperation,
  isFileShareOperation,
  isFolderShareOperation,
  isOutputOperation,
} from './type-guards';
import type {
  IGoogleDriveFileShareParameters,
  IGoogleDriveFolderShareParameters,
  IGoogleDrivePermissionUI,
  IGoogleDrivePermissionValues,
  IGoogleDriveTypedParameters,
} from './types';

/**
 * Security checker for Google Drive nodes
 * Validates node parameters and performs security checks for permission operations
 */
export class GoogleDriveChecker extends BaseNodeChecker {
  private schemaValidator: GoogleDriveSchemaValidator;

  constructor(context: ICheckerContext) {
    super(
      GOOGLE_DRIVE_CHECKER_ID,
      'Google Drive Checker',
      'Checks Google Drive nodes for permission and security issues',
      context
    );
    this.schemaValidator = new GoogleDriveSchemaValidator();
  }

  getSupportedNodeTypes(): string[] {
    return [NODE_TYPES.GOOGLE_DRIVE, NODE_TYPES.GOOGLE_DRIVE_TOOL];
  }

  private isGoogleDriveNode(node: INode): boolean {
    return this.getSupportedNodeTypes().includes(node.type);
  }

  checkNode(node: INode): ISecurityDetectionItem[] {
    this.logHeader(node);

    const detectionItems: ISecurityDetectionItem[] = [];

    // Check if node is Google Drive type
    if (!this.isGoogleDriveNode(node)) {
      return detectionItems;
    }

    // Get node parameters
    const params = node.parameters;
    if (!params) {
      detectionItems.push(
        GoogleDriveDetectionItems.configurationError(
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
        const resource = params.resource as GoogleDriveResource;
        const operation = params.operation as GoogleDriveOperation;
        detectionItems.push(
          GoogleDriveDetectionItems.configurationError(
            this.id,
            node,
            error.field,
            error.message,
            resource,
            operation
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
    params: IGoogleDriveTypedParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    this.log(`Resource: ${params.resource}, Operation: ${params.operation}`);

    // Categorize node based on operation
    this.categorizeNode(node, params);

    // Common security checks for all operations
    detectionItems.push(...this.performCommonSecurityChecks(node, params));

    // Type-specific security checks with type narrowing
    if (isFileShareOperation(params)) {
      this.log('Detected file share operation');
      detectionItems.push(...this.performFileShareSecurityChecks(node, params));
    } else if (isFolderShareOperation(params)) {
      this.log('Detected folder share operation');
      detectionItems.push(...this.performFolderShareSecurityChecks(node, params));
    }

    return detectionItems;
  }

  /**
   * Common security checks applicable to all Google Drive operations
   */
  private performCommonSecurityChecks(
    _node: INode,
    _params: IGoogleDriveTypedParameters
  ): ISecurityDetectionItem[] {
    // Currently no common security checks are needed
    return [];
  }

  /**
   * File Share
   */
  private performFileShareSecurityChecks(
    node: INode,
    params: IGoogleDriveFileShareParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    const permissionValues = this.extractPermissionValues(params);
    if (!permissionValues) {
      detectionItems.push(
        GoogleDriveDetectionItems.permissionConfigurationMissing(
          this.id,
          node,
          params.resource,
          params.operation
        )
      );
      return detectionItems;
    }

    detectionItems.push(
      ...this.performBasicPermissionSecurityChecks(node, params, permissionValues)
    );

    return detectionItems;
  }

  /**
   * Folder Share
   */
  private performFolderShareSecurityChecks(
    node: INode,
    params: IGoogleDriveFolderShareParameters
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    const permissionValues = this.extractPermissionValues(params);
    if (!permissionValues) {
      detectionItems.push(
        GoogleDriveDetectionItems.permissionConfigurationMissing(
          this.id,
          node,
          params.resource,
          params.operation
        )
      );
      return detectionItems;
    }

    detectionItems.push(
      ...this.performBasicPermissionSecurityChecks(node, params, permissionValues)
    );

    return detectionItems;
  }

  /**
   * Common method to extract permission settings
   */
  private extractPermissionValues(
    params: IGoogleDriveFileShareParameters | IGoogleDriveFolderShareParameters
  ) {
    return (params.permissionsUi as IGoogleDrivePermissionUI)?.permissionsValues;
  }

  /**
   * Basic permission security checks
   */
  private performBasicPermissionSecurityChecks(
    node: INode,
    params: IGoogleDriveFileShareParameters | IGoogleDriveFolderShareParameters,
    permissionValues: IGoogleDrivePermissionValues
  ): ISecurityDetectionItem[] {
    const detectionItems: ISecurityDetectionItem[] = [];

    // Security risk detection: Anyone can access
    if (isPublicAccess(permissionValues)) {
      detectionItems.push(
        GoogleDriveDetectionItems.anyoneAccessError(
          this.id,
          node,
          params.resource,
          params.operation,
          { permissionsValues: permissionValues }
        )
      );
    }

    // Security risk detection: Domain-wide access
    if (isDomainAccess(permissionValues)) {
      detectionItems.push(
        GoogleDriveDetectionItems.domainAccessWarning(
          this.id,
          node,
          params.resource,
          params.operation,
          { permissionsValues: permissionValues }
        )
      );
    }

    // Security risk detection: Owner permission transfer
    if (isOwnerTransfer(permissionValues)) {
      detectionItems.push(
        GoogleDriveDetectionItems.ownerTransferWarning(
          this.id,
          node,
          params.resource,
          params.operation,
          { permissionsValues: permissionValues }
        )
      );
    }

    // Check for company user/group restricted access (Note - appropriate)
    if (isCompanyUserOrGroupRestricted(permissionValues) && permissionValues.type) {
      detectionItems.push(
        GoogleDriveDetectionItems.googleDriveCompanyRestricted(
          this.id,
          node,
          params.resource,
          params.operation,
          { permissionsValues: permissionValues }
        )
      );
    }

    return detectionItems;
  }

  /**
   * Categorize Google Drive node based on operation
   */
  protected categorizeNode(_node: INode, params: IGoogleDriveTypedParameters): void {
    const SERVICE_NAME = 'googleDrive';

    // Categorize based on operation type
    if (isDataSourceOperation(params)) {
      this.addToCategory('dataSource', SERVICE_NAME);
    } else if (isOutputOperation(params)) {
      this.addToCategory('output', SERVICE_NAME);
    } else {
      this.addToCategory('other', SERVICE_NAME);
    }
  }
}
