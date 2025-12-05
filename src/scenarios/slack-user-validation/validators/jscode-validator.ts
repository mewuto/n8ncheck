import { parse } from '@babel/parser';
import traverse, { type NodePath as BabelNodePath } from '@babel/traverse';
import type { File } from '@babel/types';
import * as t from '@babel/types';
import type { INode } from 'n8n-workflow';
import { JSCodeSchemaValidator } from '../../../nodes/jscode/schema-validator';
import type { ErrorHandlingType, IJSCodeValidationDetails, ValidationMethod } from '../types';

interface IUserValidationResult {
  confidence: number;
  details: IJSCodeValidationDetails;
}

/**
 * JSCode User Validation Analyzer
 * Analyzes JavaScript code in Code nodes for user validation patterns using AST
 */
export class JSCodeUserValidator {
  private schemaValidator: JSCodeSchemaValidator;

  constructor() {
    this.schemaValidator = new JSCodeSchemaValidator();
  }

  /**
   * Analyze a single Code node for user validation
   * Uses schema validation to ensure parameters are valid before analysis
   */
  analyzeCodeNode(codeNode: INode): IUserValidationResult {
    // Default result for when validation fails
    const emptyResult: IUserValidationResult = {
      confidence: 0,
      details: {
        hasValidation: false,
        hasUserIdExtraction: false,
        hasAuthorizationList: false,
        hasValidationLogic: false,
        hasErrorHandling: false,
      },
    };

    // Check if node has parameters
    if (!codeNode.parameters) {
      return emptyResult;
    }

    // Use schema validator to validate and map parameters
    const { params, errors } = this.schemaValidator.mapToTypedParams(codeNode.parameters);

    // Handle mapping errors
    if (errors.length > 0 || !params) {
      return emptyResult;
    }

    // Get JavaScript code
    const jsCode = params.jsCode;
    if (!jsCode) {
      return emptyResult;
    }

    // Analyze the JavaScript code for user validation patterns
    return this.analyzeUserValidation(jsCode);
  }

  /**
   * Analyze JavaScript code for user validation patterns using AST
   */
  private analyzeUserValidation(jsCode: string): IUserValidationResult {
    // Parse once and reuse for all checks
    const ast = this.parseCode(jsCode);
    if (!ast) {
      // Parse failed, return empty validation result
      return {
        confidence: 0,
        details: {
          hasValidation: false,
          hasUserIdExtraction: false,
          hasAuthorizationList: false,
          hasValidationLogic: false,
          hasErrorHandling: false,
        },
      };
    }

    // Perform all checks on the same AST
    const hasUserIdExtraction = this.checkUserIdExtractionFromAST(ast);

    const authListResult = this.checkAuthorizationListFromAST(ast);
    const validationResult = this.checkValidationLogicFromAST(ast);
    const errorHandlingResult = this.checkErrorHandlingFromAST(ast);

    // Build and return the result
    return this.buildValidationResult(
      hasUserIdExtraction,
      authListResult,
      validationResult,
      errorHandlingResult
    );
  }

  /**
   * Build validation result from individual checks
   */
  private buildValidationResult(
    hasUserIdExtraction: boolean,
    authListResult: { found: boolean; userCount?: number },
    validationResult: { found: boolean; method?: ValidationMethod },
    errorHandlingResult: { found: boolean; type: ErrorHandlingType }
  ): IUserValidationResult {
    let confidence = 0;

    if (hasUserIdExtraction) {
      confidence += 0.4;
    }
    if (authListResult.found) {
      confidence += 0.3;
    }
    if (validationResult.found) {
      confidence += 0.2;
    }
    if (errorHandlingResult.found) {
      confidence += 0.1;
    }

    // Overall validation assessment: Check if all four required elements are present
    const hasValidation =
      hasUserIdExtraction &&
      authListResult.found &&
      validationResult.found &&
      errorHandlingResult.found;

    return {
      confidence: Math.min(confidence, 1.0),
      details: {
        hasValidation, // Overall assessment result
        hasUserIdExtraction,
        hasAuthorizationList: authListResult.found,
        hasValidationLogic: validationResult.found,
        hasErrorHandling: errorHandlingResult.found,
        errorHandlingType: errorHandlingResult.type,
        authorizedUserCount: authListResult.userCount,
        validationMethod: validationResult.method,
      },
    };
  }

  /**
   * Parse JavaScript code into AST with proper typing
   */
  private parseCode(jsCode: string): File | null {
    try {
      return parse(jsCode, {
        sourceType: 'script',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: ['objectRestSpread'],
      });
    } catch {
      return null;
    }
  }

  /**
   * Check if code extracts user ID from Slack trigger using AST
   */
  private checkUserIdExtractionFromAST(ast: File): boolean {
    let hasUserIdExtraction = false;

    traverse(ast, {
      MemberExpression: (path: BabelNodePath<t.MemberExpression>) => {
        // Check for $input.item.json.user pattern
        if (this.isUserIdAccessPattern(path.node)) {
          hasUserIdExtraction = true;
          path.stop();
        }
      },
      Identifier: (path: BabelNodePath<t.Identifier>) => {
        // Check for $json.user pattern
        if (
          path.node.name === '$json' &&
          path.parent &&
          t.isMemberExpression(path.parent) &&
          t.isIdentifier(path.parent.property) &&
          path.parent.property.name === 'user'
        ) {
          hasUserIdExtraction = true;
          path.stop();
        }
      },
    });

    return hasUserIdExtraction;
  }

  /**
   * Check if MemberExpression matches $input.item.json.user pattern
   */
  private isUserIdAccessPattern(node: t.MemberExpression): boolean {
    // Pattern: $input.item.json.user
    if (t.isIdentifier(node.property) && node.property.name === 'user') {
      if (t.isMemberExpression(node.object)) {
        const jsonAccess = node.object;
        if (t.isIdentifier(jsonAccess.property) && jsonAccess.property.name === 'json') {
          if (t.isMemberExpression(jsonAccess.object)) {
            const itemAccess = jsonAccess.object;
            if (t.isIdentifier(itemAccess.property) && itemAccess.property.name === 'item') {
              if (t.isIdentifier(itemAccess.object) && itemAccess.object.name === '$input') {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Check for authorization list definition using AST
   * Only supports Object format: const users = { 'userId': 'userName' }
   */
  private checkAuthorizationListFromAST(ast: File): { found: boolean; userCount?: number } {
    let authListFound = false;
    let userCount = 0;

    traverse(ast, {
      VariableDeclarator: (path: BabelNodePath<t.VariableDeclarator>) => {
        const node = path.node;

        // Check if variable name is 'users' only
        if (t.isIdentifier(node.id) && node.id.name === 'users') {
          if (t.isObjectExpression(node.init)) {
            // Object-style user list: { 'user1': 'name1', 'user2': 'name2' }
            authListFound = true;
            userCount = node.init.properties.length;
            path.stop();
          }
          // Note: Array format is explicitly not supported
        }
      },
      AssignmentExpression: (path: BabelNodePath<t.AssignmentExpression>) => {
        const node = path.node;

        // Check for assignments like users = {...}
        if (t.isIdentifier(node.left) && node.left.name === 'users') {
          if (t.isObjectExpression(node.right)) {
            authListFound = true;
            userCount = node.right.properties.length;
            path.stop();
          }
        }
      },
    });

    return { found: authListFound, userCount: authListFound ? userCount : undefined };
  }

  /**
   * Check for validation logic patterns using AST
   * Supports Object-style validation methods only
   */
  private checkValidationLogicFromAST(ast: File): { found: boolean; method?: ValidationMethod } {
    let validationFound = false;
    let method: ValidationMethod | undefined;

    traverse(ast, {
      CallExpression: (path: BabelNodePath<t.CallExpression>) => {
        const node = path.node;

        // Check for hasOwnProperty calls on users
        if (
          t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.property) &&
          node.callee.property.name === 'hasOwnProperty' &&
          t.isIdentifier(node.callee.object) &&
          node.callee.object.name === 'users'
        ) {
          validationFound = true;
          method = 'hasOwnProperty';
          path.stop();
        }
      },
      BinaryExpression: (path: BabelNodePath<t.BinaryExpression>) => {
        const node = path.node;

        // Check for 'in' operator: userId in users
        if (
          node.operator === 'in' &&
          t.isIdentifier(node.left) &&
          t.isIdentifier(node.right) &&
          node.right.name === 'users'
        ) {
          validationFound = true;
          method = 'in_operator';
          path.stop();
        }
      },
      MemberExpression: (path: BabelNodePath<t.MemberExpression>) => {
        const node = path.node;

        // Check for bracket access: users[userId]
        if (
          t.isIdentifier(node.object) &&
          node.object.name === 'users' &&
          (t.isIdentifier(node.property) || node.computed)
        ) {
          validationFound = true;
          method = 'bracket_access';
          path.stop();
        }
      },
    });

    return { found: validationFound, method };
  }

  /**
   * Check for error handling patterns using AST
   * Conditions:
   * 1. if statement contains return AND global return exists
   * 2. OR throw statement exists anywhere
   */
  private checkErrorHandlingFromAST(ast: File): {
    found: boolean;
    type: ErrorHandlingType;
  } {
    let hasIfReturn = false;
    let hasGlobalReturn = false;
    let hasThrow = false;

    traverse(ast, {
      IfStatement: (path: BabelNodePath<t.IfStatement>) => {
        // Check if this if statement contains return
        if (this.hasReturnInBlock(path.node.consequent)) {
          hasIfReturn = true;
        }
      },
      ReturnStatement: (path: BabelNodePath<t.ReturnStatement>) => {
        // Check if this return is outside of if statements
        if (!this.isInsideIfStatement(path)) {
          hasGlobalReturn = true;
        }
      },
      ThrowStatement: (path: BabelNodePath<t.ThrowStatement>) => {
        hasThrow = true;
        path.stop(); // Found throw, no need to continue
      },
    });

    // Apply judgment logic
    if (hasThrow) {
      return { found: true, type: 'throw' };
    }

    if (hasIfReturn && hasGlobalReturn) {
      return { found: true, type: 'return' };
    }

    return { found: false, type: 'none' };
  }

  /**
   * Check if a block statement contains return statement
   */
  private hasReturnInBlock(statement: t.Statement): boolean {
    if (t.isBlockStatement(statement)) {
      return statement.body.some((stmt) => t.isReturnStatement(stmt));
    } else if (t.isReturnStatement(statement)) {
      return true;
    }
    return false;
  }

  /**
   * Check if the current path is inside an if statement
   */
  private isInsideIfStatement(path: BabelNodePath<t.ReturnStatement>): boolean {
    let currentPath: BabelNodePath | null = path.parentPath;
    while (currentPath) {
      if (t.isIfStatement(currentPath.node)) {
        return true;
      }
      currentPath = currentPath.parentPath;
    }
    return false;
  }
}
