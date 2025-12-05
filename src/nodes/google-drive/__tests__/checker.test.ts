import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { GOOGLE_DRIVE_CHECKER_ID } from '../constants';
import { GOOGLE_DRIVE_DETECTION_CODES } from '../detection-items';
import { analyzeFixture } from './test-helper';

// Explicit fixture file mapping organized by severity levels
const FIXTURE_MAPPING = {
  NONE_01_SAFE_FOLDER_OPERATION: '01-none-safe-folder-operation.json',
  WARNING_02_DOMAIN_ACCESS_FILE: '02-warning-domain-access-file.json',
  WARNING_03_OWNER_TRANSFER: '03-warning-owner-transfer.json',
  WARNING_04_DOMAIN_ACCESS_FOLDER: '04-warning-domain-access-folder.json',
  ERROR_05_ANYONE_ACCESS_FILE: '05-error-anyone-access-file.json',
  ERROR_06_PERMISSION_CONFIG_MISSING: '06-error-permission-config-missing.json',
  ERROR_07_ANYONE_ACCESS_FOLDER: '07-error-anyone-access-folder.json',
  NONE_08_COMPREHENSIVE_OPERATIONS: '08-none-comprehensive-operations.json',
} as const;

describe('GoogleDriveChecker', () => {
  describe('None Patterns (No Security Detections)', () => {
    describe('Test Case 1: Safe Folder Operation', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_01_SAFE_FOLDER_OPERATION);
      });

      test('should not generate security warnings or errors', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });
    });
  });

  describe('Warning Patterns', () => {
    describe('Test Case 2: Domain Access File Share', () => {
      let results: ISecurityDetectionItem[];
      let domainDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.WARNING_02_DOMAIN_ACCESS_FILE);
        domainDetection = results.find(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.DOMAIN_ACCESS_WARNING
        );
      });

      test('should detect domain access with warning severity', () => {
        expect(domainDetection).toBeDefined();
        expect(domainDetection?.severity).toBe('warning');
      });

      test('should extract correct permission information', () => {
        expect(domainDetection?.extractedValues).toMatchObject({
          resource: 'file',
          operation: 'share',
        });
        const permissionsUi = domainDetection?.extractedValues?.permissionsUi as any;
        expect(permissionsUi?.permissionsValues).toMatchObject({
          role: 'reader',
          type: 'domain',
          domain: 'example.com',
        });
        expect(domainDetection?.confidence).toBe(1.0);
      });
    });

    describe('Test Case 3: Owner Transfer', () => {
      let results: ISecurityDetectionItem[];
      let ownerDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.WARNING_03_OWNER_TRANSFER);
        ownerDetection = results.find(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.OWNER_TRANSFER_WARNING
        );
      });

      test('should detect owner transfer with warning severity', () => {
        expect(ownerDetection).toBeDefined();
        expect(ownerDetection?.severity).toBe('warning');
      });

      test('should extract correct owner transfer information', () => {
        expect(ownerDetection?.extractedValues).toMatchObject({
          resource: 'file',
          operation: 'share',
        });
        const ownerPermissionsUi = ownerDetection?.extractedValues?.permissionsUi as any;
        expect(ownerPermissionsUi?.permissionsValues).toMatchObject({
          role: 'owner',
          type: 'user',
          emailAddress: 'newowner@example.com',
        });
        expect(ownerDetection?.confidence).toBe(1.0);
      });
    });

    describe('Test Case 4: Domain Access Folder Share', () => {
      let results: ISecurityDetectionItem[];
      let domainDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.WARNING_04_DOMAIN_ACCESS_FOLDER);
        domainDetection = results.find(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.DOMAIN_ACCESS_WARNING
        );
      });

      test('should detect folder domain access with warning severity', () => {
        expect(domainDetection).toBeDefined();
        expect(domainDetection?.severity).toBe('warning');
      });

      test('should extract correct folder permission information', () => {
        expect(domainDetection?.extractedValues).toMatchObject({
          resource: 'folder',
          operation: 'share',
        });
        const folderPermissionsUi = domainDetection?.extractedValues?.permissionsUi as any;
        expect(folderPermissionsUi?.permissionsValues).toMatchObject({
          role: 'writer',
          type: 'domain',
          domain: 'company.com',
        });
      });
    });
  });

  describe('Error Patterns', () => {
    describe('Test Case 5: Anyone Access File', () => {
      let results: ISecurityDetectionItem[];
      let anyoneDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.ERROR_05_ANYONE_ACCESS_FILE);
        anyoneDetection = results.find(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.ANYONE_ACCESS_WARNING
        );
      });

      test('should detect anyone access with error severity', () => {
        expect(anyoneDetection).toBeDefined();
        expect(anyoneDetection?.severity).toBe('error');
      });

      test('should extract correct anyone access information', () => {
        expect(anyoneDetection?.extractedValues).toMatchObject({
          resource: 'file',
          operation: 'share',
        });
        const anyonePermissionsUi = anyoneDetection?.extractedValues?.permissionsUi as any;
        expect(anyonePermissionsUi?.permissionsValues).toMatchObject({
          role: 'reader',
          type: 'anyone',
        });
        expect(anyoneDetection?.confidence).toBe(1.0);
      });
    });

    describe('Test Case 6: Permission Configuration Missing', () => {
      let results: ISecurityDetectionItem[];
      let missingDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.ERROR_06_PERMISSION_CONFIG_MISSING);
        missingDetection = results.find(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.PERMISSION_CONFIG_MISSING
        );
      });

      test('should detect missing permission configuration with error severity', () => {
        expect(missingDetection).toBeDefined();
        expect(missingDetection?.severity).toBe('error');
      });

      test('should extract correct missing configuration information', () => {
        expect(missingDetection?.extractedValues).toMatchObject({
          resource: 'file',
          operation: 'share',
        });
        expect(missingDetection?.confidence).toBe(1.0);
      });
    });

    describe('Test Case 7: Anyone Access Folder', () => {
      let results: ISecurityDetectionItem[];
      let anyoneDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.ERROR_07_ANYONE_ACCESS_FOLDER);
        anyoneDetection = results.find(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.ANYONE_ACCESS_WARNING
        );
      });

      test('should detect folder anyone access with error severity', () => {
        expect(anyoneDetection).toBeDefined();
        expect(anyoneDetection?.severity).toBe('error');
      });

      test('should extract correct folder anyone access information', () => {
        expect(anyoneDetection?.extractedValues).toMatchObject({
          resource: 'folder',
          operation: 'share',
        });
        const folderAnyonePermissionsUi = anyoneDetection?.extractedValues?.permissionsUi as any;
        expect(folderAnyonePermissionsUi?.permissionsValues).toMatchObject({
          role: 'reader',
          type: 'anyone',
        });
        expect(anyoneDetection?.confidence).toBe(1.0);
      });
    });
  });

  describe('Comprehensive Operation Validation', () => {
    describe('Test Case 8: All Google Drive Operations', () => {
      let results: ISecurityDetectionItem[];
      let googleDriveDetections: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_08_COMPREHENSIVE_OPERATIONS);
        googleDriveDetections = results.filter(
          (item) => item.checkerId === GOOGLE_DRIVE_CHECKER_ID
        );
      });

      test('should not generate any error severity detections', () => {
        const errorItems = results.filter((item) => item.severity === 'error');
        expect(errorItems).toHaveLength(0);
      });

      test('should not generate any warning severity detections', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        expect(warningItems).toHaveLength(0);
      });

      test('should not generate configuration errors', () => {
        const configErrors = googleDriveDetections.filter(
          (item) => item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.CONFIG_ERROR
        );
        expect(configErrors).toHaveLength(0);
      });

      test('should handle various operation types without errors', () => {
        // Verify that different operation types are handled correctly
        // All detections should have severity 'none' or 'note' at most
        googleDriveDetections.forEach((detection) => {
          expect(['none', 'note']).toContain(detection.severity);
        });
      });
    });
  });
});
