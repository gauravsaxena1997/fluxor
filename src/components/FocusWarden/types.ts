export type BlockType = 'permanent' | 'timeLimit';

export interface BlockedSite {
  id: string;
  url: string;
  type: BlockType;
  timeLimit?: number; // in minutes
  createdAt: number;
  // Fields for time-limit tracking
  usageTime?: number; // accumulated usage time in minutes
  lastResetDate?: string; // date string in YYYY-MM-DD format for daily reset
  lastVisitTime?: number; // timestamp of the last visit (for tracking active sessions)
  isActive?: boolean; // whether user is currently on the site
  limitReached?: boolean; // whether time limit has been reached for today
}

export interface FocusWardenStats {
  totalBlocked: number;
  permanentCount: number;
  timeLimitedCount: number;
}

export interface FocusWardenProps {
  className?: string;
}

export interface FocusWardenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  blockedSites: BlockedSite[];
  onDeleteSite: (id: string) => void;
}

export interface BlockedSiteProps {
  site: BlockedSite;
  onEdit: (site: BlockedSite) => void;
  onDelete: (id: string) => void;
} 