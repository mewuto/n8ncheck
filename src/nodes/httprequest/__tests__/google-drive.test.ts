import { beforeEach, describe, expect, test } from '@jest/globals';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { GOOGLE_DRIVE_DETECTION_CODES } from '../apis/google-drive/detection-items';
import { HTTPREQUEST_CHECKER_ID } from '../constants';
import { analyzeGoogleDriveFixture } from './test-helper';

// Google Drive integration test fixtures mapping (using original file names)
const GOOGLE_DRIVE_FIXTURE_MAPPING = {
  JSONBODY_PERMISSIONS: '09-note-google-drive-jsonbody.json',
  BODYPARAMS_PERMISSIONS: '08-note-google-drive-bodyparams.json',
} as const;

describe('HttpRequestChecker - Google Drive Integration Tests', () => {
  describe('Google Drive Integration', () => {
    describe('Test Case: Google Drive JSON Body Format', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeGoogleDriveFixture(GOOGLE_DRIVE_FIXTURE_MAPPING.JSONBODY_PERMISSIONS);
      });

      test('should detect Google Drive permissions API with JSON body', () => {
        expect(results.length).toBeGreaterThan(0);

        const googleDriveDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_COMPANY_RESTRICTED
        );

        expect(googleDriveDetection).toBeDefined();
        expect(googleDriveDetection?.severity).toBe('none');
      });

      test('should extract correct permission data from JSON body', () => {
        const googleDriveDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_COMPANY_RESTRICTED
        );

        expect(googleDriveDetection?.extractedValues?.googleDrivePermission).toMatchObject({
          type: 'group',
          role: 'reader',
          emailAddress: 'group@example.com',
        });
        expect(googleDriveDetection?.confidence).toBe(1.0);
      });

      test('should handle JSON body correctly', () => {
        const httpRequestDetection = results.find(
          (item) => item.checkerId === HTTPREQUEST_CHECKER_ID
        );

        expect(httpRequestDetection).toBeDefined();
        expect(httpRequestDetection?.extractedValues?.url).toContain(
          'googleapis.com/drive/v3/files'
        );
      });
    });

    describe('Test Case: Google Drive bodyParameters Format', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeGoogleDriveFixture(GOOGLE_DRIVE_FIXTURE_MAPPING.BODYPARAMS_PERMISSIONS);
      });

      test('should detect Google Drive permissions API with bodyParameters', () => {
        expect(results.length).toBeGreaterThan(0);

        const googleDriveDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_COMPANY_RESTRICTED
        );

        expect(googleDriveDetection).toBeDefined();
        expect(googleDriveDetection?.severity).toBe('none');
      });

      test('should extract correct permission data from bodyParameters', () => {
        const googleDriveDetection = results.find(
          (item) =>
            item.detectionCode === GOOGLE_DRIVE_DETECTION_CODES.GOOGLE_DRIVE_COMPANY_RESTRICTED
        );

        expect(googleDriveDetection?.extractedValues?.googleDrivePermission).toMatchObject({
          type: 'group',
          role: 'reader',
          emailAddress: 'group@example.com',
        });
        expect(googleDriveDetection?.confidence).toBe(1.0);
      });

      test('should handle bodyParameters correctly', () => {
        const httpRequestDetection = results.find(
          (item) => item.checkerId === HTTPREQUEST_CHECKER_ID
        );

        expect(httpRequestDetection).toBeDefined();
        expect(httpRequestDetection?.extractedValues?.url).toContain(
          'googleapis.com/drive/v3/files'
        );
      });
    });
  });
});
