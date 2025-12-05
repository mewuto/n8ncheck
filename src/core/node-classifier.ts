import { SECURITY_CONFIG } from '../constants/security-rules';
import type {
  IReviewRequiredNodeInfo,
  NodeClassification,
} from '../types/core/node-classification.types';

export class NodeClassifier {
  private safeNodesSet: Set<string>;
  private reviewRequiredMap: Map<string, IReviewRequiredNodeInfo>;

  constructor() {
    this.safeNodesSet = new Set(SECURITY_CONFIG.safeNodes);
    this.reviewRequiredMap = new Map();
    this.initializeReviewRequiredNodes();
  }

  private initializeReviewRequiredNodes(): void {
    // Convert review required nodes from config
    for (const reviewNode of SECURITY_CONFIG.reviewRequiredNodes) {
      this.reviewRequiredMap.set(reviewNode.type, {
        type: reviewNode.type,
        hasChecker: reviewNode.hasChecker,
        checkerId: reviewNode.checkerId,
        externalConnection: reviewNode.externalConnection,
      });
    }
  }

  /**
   * Classify a node type into one of three categories
   * @param nodeType - The node type to classify (e.g., 'n8n-nodes-base.code')
   * @returns NodeClassification - 'safe', 'review_required', or 'unknown'
   */
  classify(nodeType: string): NodeClassification {
    // Check if it's in the safe list (whitelist)
    if (this.safeNodesSet.has(nodeType)) {
      return 'safe';
    }

    // Check if it matches any review required pattern
    if (this.isReviewRequired(nodeType)) {
      return 'review_required';
    }

    // If not in any list, it's unknown
    return 'unknown';
  }

  /**
   * Get detailed information about a review required node
   * @param nodeType - The node type to get info for
   * @returns IReviewRequiredNodeInfo or null if not a review required node
   */
  getReviewRequiredNodeInfo(nodeType: string): IReviewRequiredNodeInfo | null {
    // Direct match first
    const directMatch = this.reviewRequiredMap.get(nodeType);
    if (directMatch) {
      return directMatch;
    }

    // Pattern matching for regex patterns
    for (const [typePattern, info] of this.reviewRequiredMap.entries()) {
      try {
        const regex = new RegExp(typePattern);
        if (regex.test(nodeType)) {
          return info;
        }
      } catch {
        // If pattern is not a valid regex, treat it as literal string
        if (typePattern === nodeType) {
          return info;
        }
      }
    }

    return null;
  }

  /**
   * Check if a node type requires review
   * @param nodeType - The node type to check
   * @returns boolean - true if review required
   */
  private isReviewRequired(nodeType: string): boolean {
    return this.getReviewRequiredNodeInfo(nodeType) !== null;
  }
}
