import { BIGQUERY_CHECKER_ID } from '../nodes/bigquery/constants';
import { GOOGLE_DRIVE_CHECKER_ID } from '../nodes/google-drive/constants';
import { GOOGLE_SHEETS_CHECKER_ID } from '../nodes/google-sheets/constants';
import { HTTPREQUEST_CHECKER_ID } from '../nodes/httprequest/constants';
import { IF_CHECKER_ID } from '../nodes/if/constants';
import { JSCODE_CHECKER_ID } from '../nodes/jscode/constants';
import { SLACK_CHECKER_ID } from '../nodes/slack/constants';
import type { IReviewRequiredNodeInfo } from '../types/core/node-classification.types';
import { NODE_TYPES } from './node-types';

// Security configuration - simplified binary classification
export interface ISecurityConfig {
  // Safe nodes that don't require review
  safeNodes: string[];
  // Nodes that require security review
  reviewRequiredNodes: IReviewRequiredNodeInfo[];
}

export const SECURITY_CONFIG: ISecurityConfig = {
  // Safe nodes that don't need security review
  safeNodes: [
    NODE_TYPES.AGGREGATE,
    NODE_TYPES.APPROVAL_UI,
    NODE_TYPES.CONVERT_TO_FILE,
    NODE_TYPES.CRON,
    NODE_TYPES.DATE_TIME,
    NODE_TYPES.DATE_TIME_TOOL,
    NODE_TYPES.ERROR_TRIGGER,
    NODE_TYPES.EXECUTION_DATA,
    NODE_TYPES.EXTRACT_FROM_FILE,
    NODE_TYPES.EXTRACT_PDF,
    NODE_TYPES.FILTER,
    NODE_TYPES.FORM,
    NODE_TYPES.HTML,
    NODE_TYPES.ITEM_LISTS,
    NODE_TYPES.LIMIT,
    NODE_TYPES.MANUAL_TRIGGER,
    NODE_TYPES.MARKDOWN,
    NODE_TYPES.MERGE,
    NODE_TYPES.MOVE_BINARY_DATA,
    NODE_TYPES.NO_OP,
    NODE_TYPES.QUICK_CHART,
    NODE_TYPES.REMOVE_DUPLICATES,
    NODE_TYPES.RENAME_KEYS,
    NODE_TYPES.SCHEDULE_TRIGGER,
    NODE_TYPES.SET,
    NODE_TYPES.SORT,
    NODE_TYPES.SPLIT_IN_BATCHES,
    NODE_TYPES.SPLIT_OUT,
    NODE_TYPES.SPREADSHEET_FILE,
    NODE_TYPES.START,
    NODE_TYPES.STOP_AND_ERROR,
    NODE_TYPES.STICKY_NOTE,
    NODE_TYPES.SUMMARIZE,
    NODE_TYPES.SWITCH,
    NODE_TYPES.WAIT,
    NODE_TYPES.XML,
    NODE_TYPES.READ_BINARY_FILE,
    NODE_TYPES.LANGCHAIN_MEMORY_BUFFER_WINDOW,
  ],

  // Nodes that require security review
  reviewRequiredNodes: [
    {
      type: NODE_TYPES.CODE,
      hasChecker: true,
      checkerId: JSCODE_CHECKER_ID,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.HTTP_REQUEST,
      hasChecker: true,
      checkerId: HTTPREQUEST_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_SHEETS,
      hasChecker: true,
      checkerId: GOOGLE_SHEETS_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_BIGQUERY,
      hasChecker: true,
      checkerId: BIGQUERY_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.SLACK,
      hasChecker: true,
      checkerId: SLACK_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.IF,
      hasChecker: true,
      checkerId: IF_CHECKER_ID,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.SLACK_TRIGGER,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.WEBHOOK,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.RESPOND_TO_WEBHOOK,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_DRIVE,
      hasChecker: true,
      checkerId: GOOGLE_DRIVE_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_DOCS,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GMAIL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GITHUB,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.FUNCTION,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.EXECUTE_COMMAND,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.READ_WRITE_FILE,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.REDIS,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_AGENT,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_OPENAI,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_OPENAI_OLD,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_ANTHROPIC,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_GEMINI,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_HTTP_TOOL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_CODE,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.NOTION,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.NOTION_TOOL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.JIRA,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.JIRA_TOOL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LINEAR_TOOL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_CALENDAR,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_CALENDAR_TOOL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_SHEETS_TOOL,
      hasChecker: true,
      checkerId: GOOGLE_SHEETS_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.GOOGLE_DOCS_TOOL,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.HTTP_REQUEST_TOOL,
      hasChecker: true,
      checkerId: HTTPREQUEST_CHECKER_ID,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.EXECUTE_WORKFLOW,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.EXECUTE_WORKFLOW_TRIGGER,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.EXECUTE_COMMAND_TOOL,
      hasChecker: false,
      externalConnection: false,
    },
    {
      type: NODE_TYPES.LANGCHAIN_SERP_API,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_QDRANT,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.SUPABASE,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_PINECONE,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.LANGCHAIN_EMBEDDINGS_OPENAI,
      hasChecker: false,
      externalConnection: true,
    },
    {
      type: NODE_TYPES.N8N,
      hasChecker: false,
      externalConnection: true,
    },
  ],
};
