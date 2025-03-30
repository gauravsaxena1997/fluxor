import { BlockedSite } from './types';

const DUNGEON_MESSAGES = [
  "The Warden has locked this site in the deepest dungeon!",
  "This site is serving time in solitary confinement.",
  "The gates of this site are sealed by the Focus Warden.",
  "This site is imprisoned for the greater good of productivity.",
  "The Warden's decree: This site shall remain locked!",
  "This site is currently in the digital dungeon.",
  "The Focus Warden has placed this site under arrest.",
  "This site is temporarily detained for your focus.",
  "The Warden's judgment: This site must remain blocked.",
  "This site is serving its sentence in the productivity prison.",
];

export const getRandomDungeonMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * DUNGEON_MESSAGES.length);
  return DUNGEON_MESSAGES[randomIndex];
};

export const normalizeUrl = (url: string): string => {
  console.log(`Normalizing URL: ${url}`);
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.error('Invalid URL provided for normalization');
    return '';
  }
  
  // Add protocol if missing
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  
  try {
    // Use URL API to parse and normalize
    const urlObj = new URL(normalized);
    
    // Get the hostname (removes protocol and path)
    normalized = urlObj.hostname;
    
    // Remove 'www.' if present
    normalized = normalized.replace(/^www\./, '');
    
    console.log(`Normalized to: ${normalized}`);
    return normalized;
  } catch (e) {
    // If URL parsing fails, fall back to basic normalization
    console.log(`URL parsing failed, using basic normalization`);
    
    // Remove protocol
    normalized = normalized.toLowerCase().replace(/^https?:\/\//, '');
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    // Remove 'www.'
    normalized = normalized.replace(/^www\./, '');
    
    // Remove path and query (take only the domain part)
    normalized = normalized.split('/')[0].split('?')[0].split('#')[0];
    
    console.log(`Basic normalized to: ${normalized}`);
    return normalized;
  }
};

export const isUrlBlocked = (url: string, blockedSites: BlockedSite[]): boolean => {
  const normalizedUrl = normalizeUrl(url);
  return blockedSites.some(site => {
    const siteUrl = normalizeUrl(site.url);
    
    // For very short domains like "x.com", we need exact matching
    if (siteUrl.length <= 5) {
      return normalizedUrl === siteUrl;
    }
    
    // For longer domains, allow for subdomains or partial matching
    return normalizedUrl === siteUrl || 
           normalizedUrl.endsWith(`.${siteUrl}`) || 
           normalizedUrl.includes(siteUrl);
  });
};

export const getBlockedSiteInfo = (url: string, blockedSites: BlockedSite[]): BlockedSite | null => {
  const normalizedUrl = normalizeUrl(url);
  return blockedSites.find(site => {
    const siteUrl = normalizeUrl(site.url);
    return normalizedUrl === siteUrl || normalizedUrl.endsWith(`.${siteUrl}`);
  }) || null;
};

export const calculateTimeRemaining = (site: BlockedSite): number | null => {
  if (site.type !== 'timeLimit' || !site.timeLimit) return null;
  
  const elapsedMinutes = (Date.now() - site.createdAt) / (1000 * 60);
  const remainingMinutes = site.timeLimit - elapsedMinutes;
  
  return Math.max(0, Math.floor(remainingMinutes));
};

export const isTimeLimitExpired = (site: BlockedSite): boolean => {
  if (site.type !== 'timeLimit') return false;
  return calculateTimeRemaining(site) === 0;
};

/**
 * Returns the favicon URL for a given website URL
 * @param url The website URL
 * @returns The favicon URL for the website
 */
export const getFaviconUrl = (url: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
  }
  
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(normalizedUrl);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch (e) {
    // Return a default icon if URL parsing fails
    console.error('Error getting favicon:', e);
    return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
  }
}; 