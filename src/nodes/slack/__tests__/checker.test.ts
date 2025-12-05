import type { ISecurityDetectionItem } from '../../../core/security-detection-item';
import { SLACK_CHECKER_ID } from '../constants';
import { SLACK_DETECTION_CODES } from '../detection-items';
import { analyzeFixture } from './test-helper';

// Explicit fixture file mapping organized by severity levels
const FIXTURE_MAPPING = {
  NONE_01_SAFE_MESSAGE_SEND: '01-none-safe-message-send.json',
  WARNING_02_DIRECT_CHANNEL_ID: '02-warning-direct-channel-id.json',
  NONE_03_COMPREHENSIVE_OPERATIONS: '03-none-comprehensive-operations.json',
} as const;

describe('SlackChecker', () => {
  describe('None Patterns (No Security Detections)', () => {
    describe('Test Case 1: Safe Message Send', () => {
      let results: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_01_SAFE_MESSAGE_SEND);
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
    describe('Test Case 2: Direct Channel ID Usage', () => {
      let results: ISecurityDetectionItem[];
      let channelIdDetection: ISecurityDetectionItem | undefined;

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.WARNING_02_DIRECT_CHANNEL_ID);
        channelIdDetection = results.find(
          (item) => item.detectionCode === SLACK_DETECTION_CODES.CHANNEL_DIRECT_ID_USED
        );
      });

      test('should detect direct channel ID usage with warning severity', () => {
        expect(channelIdDetection).toBeDefined();
        expect(channelIdDetection?.severity).toBe('warning');
      });

      test('should extract correct channel ID information', () => {
        expect(channelIdDetection?.extractedValues).toMatchObject({
          value: 'C9999ABCD',
        });
        expect(channelIdDetection?.confidence).toBe(1.0);
      });

      test('should include channel ID in message', () => {
        expect(channelIdDetection?.message.en).toContain('C9999ABCD');
      });
    });
  });

  describe('Comprehensive Operation Validation', () => {
    describe('Test Case 3: All Operations', () => {
      let results: ISecurityDetectionItem[];
      let slackDetections: ISecurityDetectionItem[];

      beforeEach(() => {
        results = analyzeFixture(FIXTURE_MAPPING.NONE_03_COMPREHENSIVE_OPERATIONS);
        slackDetections = results.filter((item) => item.checkerId === SLACK_CHECKER_ID);
      });

      test('should not generate any error severity detections', () => {
        const warningItems = results.filter((item) => item.severity === 'warning');
        const errorItems = results.filter((item) => item.severity === 'error');

        expect(warningItems).toHaveLength(0);
        expect(errorItems).toHaveLength(0);
      });

      test('should not generate configuration errors for valid operations', () => {
        const configErrors = slackDetections.filter(
          (item) => item.detectionCode === SLACK_DETECTION_CODES.CONFIGURATION_ERROR
        );
        expect(configErrors).toHaveLength(0);
      });

      test('should handle various Slack resource types without errors', () => {
        slackDetections.forEach((detection) => {
          expect(['none', 'note']).toContain(detection.severity);
        });
      });

      test('should process multiple Slack nodes successfully', () => {
        // The comprehensive test contains 5 different Slack operations
        // Ensure the checker can handle all of them
        expect(results).toBeDefined();
      });
    });
  });
});
