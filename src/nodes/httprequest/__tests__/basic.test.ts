import { beforeEach, describe, expect, test } from '@jest/globals';
import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { HTTPREQUEST_CHECKER_ID } from '../constants';
import { HTTPREQUEST_DETECTION_CODES } from '../detection-items';
import { analyzeBasicFixture } from './test-helper';

// Basic functionality test fixtures mapping (using numbered file names in basic directory)
const BASIC_FIXTURE_MAPPING = {
  NONE_DEV_URL: '01-none-dev-url.json',
  WARNING_PROD_URL: '02-warning-prod-url.json',
  NOTE_DYNAMIC_URL_EXPRESSION: '03-note-dynamic-url-json.json',
  NOTE_DYNAMIC_URL_TEMPLATE: '04-note-dynamic-url-template.json',
  NOTE_DYNAMIC_JSONBODY: '05-note-dynamic-jsonbody.json',
  NOTE_DYNAMIC_BODY: '06-note-dynamic-body.json',
  ERROR_CONFIG_ERROR: '07-error-config-error.json',
} as const;

describe('HttpRequestChecker - Basic Tests', () => {
  describe('None Patterns (No Security Detections)', () => {
    describe('Test Case: Dev URL', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.NONE_DEV_URL);
      });

      test('should not generate any security warnings for dev URL', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });

      test('should not generate HTTP Request specific security detections', () => {
        const httpRequestDetections = results.filter(
          (item) => item.checkerId === HTTPREQUEST_CHECKER_ID
        );

        expect(httpRequestDetections).toHaveLength(0);
      });
    });
  });

  describe('Warning Patterns', () => {
    describe('Test Case: Production URL Detection', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.WARNING_PROD_URL);
      });

      test('should detect production URL and generate warning', () => {
        expect(results.length).toBeGreaterThan(0);

        const prodWarning = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.PRODUCTION_URL_DETECTED
        );

        expect(prodWarning).toBeDefined();
        expect(prodWarning?.severity).toBe('warning');
      });

      test('should extract correct URL information', () => {
        const prodWarning = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.PRODUCTION_URL_DETECTED
        );

        expect(prodWarning?.extractedValues).toMatchObject({
          url: expect.stringContaining('prod'),
        });
        expect(prodWarning?.confidence).toEqual(1.0);
      });
    });
  });

  describe('Note Patterns', () => {
    describe('Test Case: Dynamic URL Construction (n8n expression)', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.NOTE_DYNAMIC_URL_EXPRESSION);
      });

      test('should detect n8n expression dynamic URL construction', () => {
        expect(results.length).toBeGreaterThan(0);

        const dynamicNote = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.DYNAMIC_URL_CONSTRUCTION
        );

        expect(dynamicNote).toBeDefined();
        expect(dynamicNote?.severity).toBe('warning');
      });
    });

    describe('Test Case: Dynamic URL Construction (template literal)', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.NOTE_DYNAMIC_URL_TEMPLATE);
      });

      test('should detect template literal dynamic URL construction', () => {
        expect(results.length).toBeGreaterThan(0);

        const dynamicNote = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.DYNAMIC_URL_CONSTRUCTION
        );

        expect(dynamicNote).toBeDefined();
        expect(dynamicNote?.severity).toBe('warning');
      });
    });

    describe('Test Case: Dynamic JSON Body Construction', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.NOTE_DYNAMIC_JSONBODY);
      });

      test('should detect dynamic JSON body construction', () => {
        expect(results.length).toBeGreaterThan(0);

        const dynamicNote = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.DYNAMIC_BODY_CONSTRUCTION
        );

        expect(dynamicNote).toBeDefined();
        expect(dynamicNote?.severity).toBe('warning');
      });

      test('should extract correct dynamic JSON body information', () => {
        const dynamicNote = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.DYNAMIC_BODY_CONSTRUCTION
        );

        expect(dynamicNote?.extractedValues).toMatchObject({
          jsonBody: expect.stringContaining('$json'),
        });
        expect(dynamicNote?.confidence).toBe(0.8);
      });
    });

    describe('Test Case: Dynamic Body Construction', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.NOTE_DYNAMIC_BODY);
      });

      test('should detect dynamic body construction', () => {
        expect(results.length).toBeGreaterThan(0);

        const dynamicNote = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.DYNAMIC_BODY_CONSTRUCTION
        );

        expect(dynamicNote).toBeDefined();
        expect(dynamicNote?.severity).toBe('warning');
      });

      test('should extract correct dynamic body information', () => {
        const dynamicNote = results.find(
          (item) => item.detectionCode === HTTPREQUEST_DETECTION_CODES.DYNAMIC_BODY_CONSTRUCTION
        );

        expect(dynamicNote?.extractedValues).toMatchObject({
          body: expect.stringContaining('process.env'),
        });
        expect(dynamicNote?.confidence).toBe(0.8);
      });
    });
  });

  describe('Error Patterns', () => {
    describe('Test Case: Configuration Error', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeBasicFixture(BASIC_FIXTURE_MAPPING.ERROR_CONFIG_ERROR);
      });

      test('should not generate detection items when URL is missing', () => {
        // According to user requirements: URLがない場合はそもそもdetection itemを作成する必要はないです
        expect(results.length).toBe(0);
      });
    });
  });
});
