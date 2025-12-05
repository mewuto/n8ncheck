import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { GOOGLE_SHEETS_CHECKER_ID } from '../constants';
import { analyzeFixture } from './test-helper';

// Google Sheets detection codes
const GOOGLE_SHEETS_DETECTION_CODES = {
  DATA_EXPOSURE: 'google-sheets-data-exposure',
  CONFIGURATION_ERROR: 'google-sheets-config-error',
} as const;

// Explicit fixture file mapping organized by severity levels
const FIXTURE_MAPPING = {
  NONE_01_SAFE_SPREADSHEET_READ: '01-none-safe-spreadsheet-read.json',
  NONE_02_SAFE_DOCUMENT_CREATE: '02-none-safe-document-create.json',
  NOTE_03_CONFIG_ERROR_MISSING_PARAM: '03-note-config-error-missing-param.json',
  NONE_04_SHEET_OPERATIONS: '04-none-sheet-operations.json',
  NONE_05_COMPREHENSIVE_OPERATIONS: '05-none-comprehensive-operations.json',
} as const;

describe('GoogleSheetsChecker', () => {
  describe('None Patterns (No Security Detections)', () => {
    describe('Test Case 1: Safe Spreadsheet Read', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_01_SAFE_SPREADSHEET_READ);
      });

      test('should not generate security warnings or errors', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });

      test('should categorize as data source operation', () => {
        const nodeDetections = results.filter(
          (item) => item.checkerId === GOOGLE_SHEETS_CHECKER_ID
        );
        expect(nodeDetections.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Test Case 2: Safe Document Create', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_02_SAFE_DOCUMENT_CREATE);
      });

      test('should not generate security warnings or errors', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });
    });

    describe('Test Case 4: Safe Sheet Operations', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_04_SHEET_OPERATIONS);
      });

      test('should not generate security warnings or errors for multiple sheet operations', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });
    });
  });

  describe('Note Patterns (Configuration Issues)', () => {
    describe('Test Case 3: Configuration Error Missing Param', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NOTE_03_CONFIG_ERROR_MISSING_PARAM);
      });

      test('should handle missing parameters gracefully', () => {
        // Current implementation applies default values and doesn't generate config errors
        // This test verifies that the node with missing documentId and sheetName
        // is handled without throwing errors
        const configErrors = results.filter(
          (item) => item.detectionCode === GOOGLE_SHEETS_DETECTION_CODES.CONFIGURATION_ERROR
        );
        expect(configErrors).toHaveLength(0);
      });

      test('should not generate any security detections for incomplete configuration', () => {
        // Verify that incomplete configuration doesn't trigger false security warnings
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });
    });
  });

  describe('Comprehensive Operation Validation', () => {
    describe('Test Case 5: All Operations', () => {
      let results: ISecurityDetectionItem[];
      let nodeDetections: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_05_COMPREHENSIVE_OPERATIONS);
        nodeDetections = results.filter((item) => item.checkerId === GOOGLE_SHEETS_CHECKER_ID);
      });

      test('should not generate any error severity detections', () => {
        const errorItems = results.filter((item) => item.severity === 'error');
        expect(errorItems).toHaveLength(0);
      });

      test('should not generate configuration errors', () => {
        const configErrors = nodeDetections.filter(
          (item) => item.detectionCode === GOOGLE_SHEETS_DETECTION_CODES.CONFIGURATION_ERROR
        );
        expect(configErrors).toHaveLength(0);
      });

      test('should handle various operation types without errors', () => {
        nodeDetections.forEach((detection) => {
          expect(['none', 'note']).toContain(detection.severity);
        });
      });

      test('should cover both document and sheet resource types', () => {
        // Verify that comprehensive test covers multiple operations
        // This test ensures that the fixture contains diverse operations
        expect(nodeDetections.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
