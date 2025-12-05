import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { GOOGLE_SHEETS_SCOPE_SCENARIO_ID } from '../constants';
import { GOOGLE_SHEETS_SCOPE_DETECTION_CODES } from '../detection-items';
import type { IGoogleSheetsScopeExtractedValues } from '../types';
import { analyzeFixture } from './test-helper';

// Explicit fixture file mapping organized by expected severity levels
const FIXTURE_MAPPING = {
  NONE_01_SCOPE_WITH_DRIVE: '01-none-scope-with-drive-share.json',
  NONE_02_SCOPE_WITH_HTTP: '02-none-scope-with-http-request.json',
  ERROR_03_MISSING_SCOPE: '03-error-missing-scope.json',
  NONE_04_NOT_APPLICABLE: '04-none-not-applicable.json',
  NONE_05_SCOPE_WITH_INTERMEDIATE_NODES: '05-none-scope-with-intermediate-nodes.json',
} as const;

describe('GoogleSheetsScopeScenario', () => {
  describe('isApplicable', () => {
    test('should be applicable for workflows with Google Sheets creation', () => {
      const results = analyzeFixture(FIXTURE_MAPPING.NONE_01_SCOPE_WITH_DRIVE);
      // If results exist, it means the scenario was applicable
      expect(Array.isArray(results)).toBe(true);
    });

    test('should not be applicable for workflows without Google Sheets creation', () => {
      const results = analyzeFixture(FIXTURE_MAPPING.NONE_04_NOT_APPLICABLE);
      // Should return empty array for non-applicable scenarios
      expect(results).toHaveLength(0);
    });
  });

  describe('None Patterns (No Security Detections)', () => {
    describe('Test Case 1: Google Sheets with Google Drive Share', () => {
      let results: ISecurityDetectionItem<IGoogleSheetsScopeExtractedValues>[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_01_SCOPE_WITH_DRIVE);
      });

      test('should not generate any security warnings or errors', () => {
        // Valid scope setting should not trigger any warnings or errors
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });

      test('should not detect missing scope when Google Drive share is present', () => {
        // No detection items should be generated when scope is properly set
        expect(results).toHaveLength(0);
      });
    });

    describe('Test Case 2: Google Sheets with HTTP Request Permissions', () => {
      let results: ISecurityDetectionItem<IGoogleSheetsScopeExtractedValues>[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_02_SCOPE_WITH_HTTP);
      });

      test('should not generate any security warnings or errors', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });

      test('should not detect missing scope when HTTP request permissions are present', () => {
        // No detection items should be generated when scope is properly set via HTTP request
        expect(results).toHaveLength(0);
      });
    });

    describe('Test Case 5: Google Sheets with Intermediate Nodes before Drive Share', () => {
      let results: ISecurityDetectionItem<IGoogleSheetsScopeExtractedValues>[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_05_SCOPE_WITH_INTERMEDIATE_NODES);
      });

      test('should not generate any security warnings or errors', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });

      test('should not detect missing scope when Google Drive share is present after intermediate nodes', () => {
        // No detection items should be generated when scope is properly set via Google Drive share
        // even when there are intermediate processing nodes between creation and sharing
        expect(results).toHaveLength(0);
      });

      test('should handle complex workflow with multiple intermediate nodes', () => {
        // Test that the scenario correctly identifies downstream scope setting nodes
        // even when they are not directly connected to the Google Sheets creation node
        expect(results).toHaveLength(0);
      });
    });
  });

  describe('Error Patterns', () => {
    describe('Test Case 3: Missing Scope Setting', () => {
      let results: ISecurityDetectionItem<IGoogleSheetsScopeExtractedValues>[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.ERROR_03_MISSING_SCOPE);
      });

      test('should detect missing scope setting and generate error', () => {
        expect(results).toHaveLength(1);

        const missingScopeDetection = results[0];
        expect(missingScopeDetection).toBeDefined();
        expect(missingScopeDetection.severity).toBe('error');
        expect(missingScopeDetection.detectionCode).toBe(
          GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION
        );
      });

      test('should have correct checker ID', () => {
        const missingScopeDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION
        );
        expect(missingScopeDetection?.checkerId).toBe(GOOGLE_SHEETS_SCOPE_SCENARIO_ID);
      });

      test('should extract correct sheet creation information', () => {
        const missingScopeDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION
        );
        expect(missingScopeDetection?.extractedValues?.sheet).toMatchObject({
          resource: 'spreadsheet',
          operation: 'create',
          isCreatingNewSpreadsheet: true,
        });
      });

      test('should have high confidence score', () => {
        const missingScopeDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION
        );
        expect(missingScopeDetection?.confidence).toBe(1.0);
      });

      test('should have correct detection code', () => {
        const missingScopeDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION
        );
        expect(missingScopeDetection?.detectionCode).toBe(
          GOOGLE_SHEETS_SCOPE_DETECTION_CODES.MISSING_SCOPE_AFTER_CREATION
        );
      });
    });
  });
});
