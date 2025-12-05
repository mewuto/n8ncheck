/**
 * Node classification types for security analysis
 */
export type NodeClassification = 'safe' | 'review_required' | 'unknown';

export interface IReviewRequiredNodeInfo {
  type: string;
  hasChecker: boolean;
  checkerId?: string;
  externalConnection: boolean;
}
