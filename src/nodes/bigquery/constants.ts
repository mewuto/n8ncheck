export const BIGQUERY_CHECKER_ID = 'bigquery-checker';

export const BIGQUERY_OPERATIONS = ['executeQuery', 'insert'] as const;
export type BigQueryOperation = (typeof BIGQUERY_OPERATIONS)[number];
