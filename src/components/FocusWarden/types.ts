export type BlockType = 'permanent' | 'timeLimit';

export interface BlockedSite {
  id: string;
  url: string;
  type: BlockType;
  timeLimit?: number; // in minutes
  createdAt: number;
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