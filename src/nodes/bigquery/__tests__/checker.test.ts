import { BIGQUERY_DETECTION_CODES } from '../detection-items';
import { analyzeFixture } from './test-helper';

// Explicit fixture file mapping organized by severity levels
const FIXTURE_MAPPING = {
  NONE_01_DEV_PROJECT: '01-none-dev-project.json',
  WARNING_02_PROD_PROJECT: '02-warning-prod-project.json',
  WARNING_03_DYNAMIC_QUERY: '03-warning-dynamic-query.json',
  WARNING_04_PROD_DATASET: '04-warning-prod-dataset.json',
  WARNING_05_PROD_INSERT: '05-warning-prod-insert.json',
  NONE_06_TOOL_DEV: '06-none-tool-dev.json',
  WARNING_07_TOOL_PROD: '07-warning-tool-prod.json',
  NONE_08_EMPTY_VALUES: '08-none-empty-values.json',
} as const;

describe('BigQueryChecker', () => {
  describe('None Patterns (No Security Detections)', () => {
    describe('Test Case 1: Dev Project BigQuery', () => {
      test('should generate none severity for dev environment', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.NONE_01_DEV_PROJECT);
        const envDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED
        );

        expect(envDetection).toBeDefined();
        expect(envDetection?.severity).toBe('none');
      });
    });

    describe('Test Case 6: BigQuery Tool Dev Environment', () => {
      test('should generate none severity for dev tool', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.NONE_06_TOOL_DEV);
        const envDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED
        );

        expect(envDetection).toBeDefined();
        expect(envDetection?.severity).toBe('none');
      });
    });

    describe('Test Case 8: Empty Values BigQuery', () => {
      test('should generate none severity for empty values', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.NONE_08_EMPTY_VALUES);
        const envDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED
        );

        expect(envDetection).toBeDefined();
        expect(envDetection?.severity).toBe('none');
      });
    });
  });

  describe('Warning Patterns', () => {
    describe('Test Case 2: Production Project Access', () => {
      test('should detect production access with warning severity', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.WARNING_02_PROD_PROJECT);
        const prodDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED
        );

        expect(prodDetection).toBeDefined();
        expect(prodDetection?.severity).toBe('warning');
        expect(prodDetection?.extractedValues).toMatchObject({
          projectId: 'example-prod',
          operation: 'executeQuery',
        });
      });
    });

    describe('Test Case 3: Dynamic Query Construction', () => {
      test('should detect dynamic query with warning severity', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.WARNING_03_DYNAMIC_QUERY);
        const dynamicQueryDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.DYNAMIC_QUERY_DETECTED
        );

        expect(dynamicQueryDetection).toBeDefined();
        expect(dynamicQueryDetection?.severity).toBe('warning');
        expect(dynamicQueryDetection?.extractedValues).toMatchObject({
          hasDynamicQuery: true,
          operation: 'executeQuery',
        });
      });
    });

    describe('Test Case 4: Production Dataset Reference', () => {
      test('should detect production dataset with warning severity', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.WARNING_04_PROD_DATASET);
        const prodDatasetDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PRODUCTION_SQL_QUERY_DETECTED
        );

        expect(prodDatasetDetection).toBeDefined();
        expect(prodDatasetDetection?.severity).toBe('warning');
      });
    });

    describe('Test Case 7: BigQuery Tool Production Access', () => {
      test('should detect tool production access with warning severity', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.WARNING_07_TOOL_PROD);
        const prodDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED
        );

        expect(prodDetection).toBeDefined();
        expect(prodDetection?.severity).toBe('warning');
        expect(prodDetection?.extractedValues).toMatchObject({
          projectId: 'example-prod',
          operation: 'executeQuery',
        });
      });
    });

    describe('Test Case 5: Production Insert Operation', () => {
      test('should detect production access and dataset warnings', () => {
        const results = analyzeFixture(FIXTURE_MAPPING.WARNING_05_PROD_INSERT);

        const prodDetection = results.find(
          (item) => item.detectionCode === BIGQUERY_DETECTION_CODES.PROJECT_ENV_DETECTED
        );
        expect(prodDetection).toBeDefined();
        expect(prodDetection?.severity).toBe('warning');

        const datasetDetection = results.find(
          (item) =>
            item.detectionCode === BIGQUERY_DETECTION_CODES.PRODUCTION_INSERT_RESOURCE_ACCESS
        );
        expect(datasetDetection).toBeDefined();
        expect(datasetDetection?.severity).toBe('warning');
      });
    });
  });
});
