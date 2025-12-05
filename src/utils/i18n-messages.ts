/**
 * Internationalization messages for PR comment reporter
 * Each message is defined with both Japanese and English versions side by side for easier maintenance
 */

export interface I18nMessage {
  ja: string;
  en: string;
}

interface PrCommentMessages {
  headers: {
    securityCheckResults: I18nMessage;
    resourceSummary: I18nMessage;
    securityDetections: I18nMessage;
    workflowGraphAnalysis: I18nMessage;
    preChecklistItems: I18nMessage;
  };
  fields: {
    workflowId: I18nMessage;
    workflowName: I18nMessage;
    analysisDate: I18nMessage;
    nodes: I18nMessage;
    riskLevel: I18nMessage;
    inputTrigger: I18nMessage;
    dataSources: I18nMessage;
    outputDestination: I18nMessage;
    others: I18nMessage;
    othersNote: I18nMessage;
    totalNodes: I18nMessage;
    totalConnections: I18nMessage;
    stronglyConnectedComponents: I18nMessage;
    loopComponents: I18nMessage;
    loopAnalysis: I18nMessage;
    executionOrder: I18nMessage;
    circularDependencyDetected: I18nMessage;
    workflowDiagrams: I18nMessage;
    clickToExpand: I18nMessage;
    timeSavedPerExecution: I18nMessage;
  };
  severityLevels: {
    criticalIssues: I18nMessage;
    warnings: I18nMessage;
    notes: I18nMessage;
    informational: I18nMessage;
  };
  riskLevelActions: {
    highAction: I18nMessage;
    mediumAction: I18nMessage;
    lowAction: I18nMessage;
  };
  checklist: {
    userTitle: I18nMessage;
    approverTitle: I18nMessage;
    user: {
      credentialsAndPermissions: I18nMessage;
    };
    approver: {
      securityDetections: I18nMessage;
      permissionConsistency: I18nMessage;
      teamBoundary: I18nMessage;
    };
  };
}

export const messages: PrCommentMessages = {
  headers: {
    securityCheckResults: {
      ja: '🔒 n8n ワークフローセキュリティチェック結果',
      en: '🔒 n8n Workflow Security Check Results',
    },
    resourceSummary: {
      ja: '📊 リソース概要',
      en: '📊 Resource Summary',
    },
    securityDetections: {
      ja: '🔍 セキュリティ検出結果',
      en: '🔍 Security Detection Results',
    },
    workflowGraphAnalysis: {
      ja: '📊 ワークフローグラフ分析',
      en: '📊 Workflow Graph Analysis',
    },
    preChecklistItems: {
      ja: '☑️ 事前チェックリスト',
      en: '☑️ Pre-checklist Items',
    },
  },
  fields: {
    workflowId: {
      ja: 'ワークフローID',
      en: 'Workflow ID',
    },
    workflowName: {
      ja: 'ワークフロー名',
      en: 'Workflow Name',
    },
    analysisDate: {
      ja: '分析日',
      en: 'Analysis Date',
    },
    nodes: {
      ja: 'ノード数',
      en: 'Nodes',
    },
    riskLevel: {
      ja: 'リスクレベル',
      en: 'Risk Level',
    },
    inputTrigger: {
      ja: '入力/トリガー',
      en: 'Input/Trigger',
    },
    dataSources: {
      ja: 'データソース',
      en: 'Data Sources',
    },
    outputDestination: {
      ja: '出力/出力先',
      en: 'Output/Destination',
    },
    others: {
      ja: 'その他（チェッカー未対応）',
      en: 'Others (not supported by checker)',
    },
    othersNote: {
      ja: '*(これらのノードはこのチェッカーで未定義です。重要なノードを個別に確認し、必要に応じてチェッカーを実装してください。)*',
      en: '*(These nodes are not defined in this checker. Please review important nodes individually and implement checkers if necessary.)*',
    },
    totalNodes: {
      ja: 'ノード総数',
      en: 'Total Nodes',
    },
    totalConnections: {
      ja: '接続総数',
      en: 'Total Connections',
    },
    stronglyConnectedComponents: {
      ja: '強連結成分（Strongly Connected Components）',
      en: 'Strongly Connected Components',
    },
    loopComponents: {
      ja: 'ループ成分',
      en: 'Loop Components',
    },
    loopAnalysis: {
      ja: 'ループ分析',
      en: 'Loop Analysis',
    },
    executionOrder: {
      ja: '実行順序（SCC単位）',
      en: 'Execution Order (by SCC)',
    },
    circularDependencyDetected: {
      ja: '⚠️ **循環依存が検出されました** - 実行順序を決定できません',
      en: '⚠️ **Circular dependency detected** - cannot determine execution order',
    },
    workflowDiagrams: {
      ja: 'ワークフロー図',
      en: 'Workflow Diagrams',
    },
    clickToExpand: {
      ja: 'ワークフロー図を展開するにはクリック',
      en: 'Click to expand workflow diagrams',
    },
    timeSavedPerExecution: {
      ja: '実行あたりの推定削減時間',
      en: 'Estimated time saved per execution',
    },
  },
  severityLevels: {
    criticalIssues: {
      ja: '重要な問題',
      en: 'Critical Issues',
    },
    warnings: {
      ja: '警告',
      en: 'Warnings',
    },
    notes: {
      ja: '参考',
      en: 'Reference',
    },
    informational: {
      ja: 'OK',
      en: 'OK',
    },
  },
  riskLevelActions: {
    highAction: {
      ja: 'の内容を確認し、すぐに修正してください。',
      en: ' section content and fix immediately.',
    },
    mediumAction: {
      ja: 'の内容を確認し、問題がなければ事前チェックリストを埋めてからレビューのリクエストを送信してください。',
      en: ' section content and if no issues, complete the pre-checklist then send review request.',
    },
    lowAction: {
      ja: '事前チェックリストを埋めてからレビューのリクエストを送信してください。',
      en: 'Please complete the pre-checklist then send review request.',
    },
  },
  checklist: {
    userTitle: {
      ja: '☑️ PR作成者チェックリスト（提出前に確認）',
      en: '☑️ PR Author Checklist (verify before submission)',
    },
    approverTitle: {
      ja: '👥 コードオーナーチェックリスト（承認前に確認）',
      en: '👥 Code Owner Checklist (verify before approval)',
    },
    user: {
      credentialsAndPermissions: {
        ja: '認証情報と権限設定が適切である',
        en: 'Credentials and permissions are configured appropriately',
      },
    },
    approver: {
      securityDetections: {
        ja: 'セキュリティ検出結果を確認し、問題ないことを検証した',
        en: 'Security detection results reviewed and verified as acceptable',
      },
      permissionConsistency: {
        ja: '権限整合性が確保されていることを確認した',
        en: 'Permission consistency verified',
      },
      teamBoundary: {
        ja: 'チーム境界の維持が適切であることを確認した',
        en: 'Team boundary maintenance verified as appropriate',
      },
    },
  },
};

/**
 * Common node message builders for shared patterns
 * Creates standardized node messages with consistent format
 */
export const COMMON_NODE_MESSAGES = {
  /**
   * Creates a message when node parameters are not configured or missing
   */
  PARAMETERS_NOT_CONFIGURED: (): I18nMessage => ({
    ja: 'ノードパラメータが設定されていません',
    en: 'Node parameters are not configured',
  }),
} as const;

export const i18n = {
  headers: messages.headers,
  fields: messages.fields,
  severityLevels: messages.severityLevels,
  riskLevelActions: messages.riskLevelActions,
  checklist: messages.checklist,
  commonNode: COMMON_NODE_MESSAGES,
} as const;

/**
 * Configuration error message builder for detection items
 * Creates standardized configuration error messages with consistent format
 */
export function createConfigurationErrorMessage(
  errorMessage: I18nMessage,
  field?: string
): I18nMessage {
  const fieldMessageEn = field ? ` Please configure ${field} correctly.` : '';
  const fieldMessageJa = field ? ` ${field}を正しく設定してください。` : '';

  return {
    en: `🔧 Maintainer Notice: config error - ${errorMessage.en}.${fieldMessageEn}`,
    ja: `🔧 メンテナー通知: 設定エラー - ${errorMessage.ja}。${fieldMessageJa}`,
  };
}
