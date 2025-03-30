import { BlockedSite } from '../components/FocusWarden/types';

// Log extension startup
console.log('Focus Warden extension background script started');

// Initialize immediately
initializeExtension();

// Function to initialize extension
async function initializeExtension() {
  console.log('Focus Warden extension initialized');
  await loadAndApplyRules();
}

// Function to get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Function to check if time limit tracking should be reset (new day)
function shouldResetTimeLimit(site: BlockedSite): boolean {
  if (!site.lastResetDate) {
    return true;
  }
  
  const today = getTodayDateString();
  return today !== site.lastResetDate;
}

// Function to reset time limit tracking for a new day
function resetTimeLimitTracking(site: BlockedSite): BlockedSite {
  const updatedSite = { ...site };
  updatedSite.usageTime = 0;
  updatedSite.lastResetDate = getTodayDateString();
  updatedSite.limitReached = false;
  console.log(`Reset time limit tracking for ${site.url}`);
  return updatedSite;
}

// Function to check if time limit has been reached for a site
function hasReachedTimeLimit(site: BlockedSite): boolean {
  // If already marked as reached, return true
  if (site.limitReached) {
    return true;
  }
  
  // Check if this is a time-limited site with valid data
  if (site.type !== 'timeLimit' || !site.timeLimit) {
    return false;
  }
  
  // If no usage tracking yet, initialize it
  if (!site.usageTime) {
    return false;
  }
  
  // Check if time limit reached
  return site.usageTime >= site.timeLimit;
}

// Function to check if a site should be blocked now
function shouldBlockSite(site: BlockedSite): boolean {
  // Permanent blocks are always active
  if (site.type === 'permanent') {
    return true;
  }
  
  // For time limit sites, check if limit reached
  if (site.type === 'timeLimit') {
    return hasReachedTimeLimit(site);
  }
  
  return false;
}

// Function to create a URL pattern from a domain
function createUrlPattern(domain: string): string[] {
  console.log(`Creating pattern for original domain: ${domain}`);
  
  // Remove any protocols
  let cleanDomain = domain.replace(/^https?:\/\//, '');
  
  // Remove paths and query strings
  cleanDomain = cleanDomain.split('/')[0].split('?')[0].split('#')[0];
  
  // Remove www. if present
  cleanDomain = cleanDomain.replace(/^www\./, '');
  
  console.log(`Cleaned domain: ${cleanDomain}`);
  
  // Create multiple patterns to ensure comprehensive coverage
  const patterns = [
    // Match the exact domain (without any subdomain)
    `*://${cleanDomain}/*`,
    
    // Match any subdomain of the domain
    `*://*.${cleanDomain}/*`
  ];
  
  return patterns;
}

// Function to update dynamic rules based on blocked sites
async function updateDynamicRules(blockedSites: BlockedSite[]) {
  try {
    console.log('Updating rules for blocked sites:', blockedSites);
    
    // Remove all existing dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(rule => rule.id);
    
    if (removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds
      });
    }

    // Prepare new rules
    const newRules: chrome.declarativeNetRequest.Rule[] = [];
    
    // Start rule IDs from a high number to avoid conflicts
    let ruleIdCounter = 1000;

    // Convert blocked sites to declarativeNetRequest rules
    blockedSites
      .filter(site => shouldBlockSite(site))
      .forEach((site) => {
        const urlPatterns = createUrlPattern(site.url);
        console.log(`Creating block patterns for ${site.url}:`, urlPatterns);
        
        // Create the redirect URL with parameters
        const params = new URLSearchParams();
        params.append('url', site.url);
        params.append('type', site.type);
        if (site.timeLimit) params.append('timeLimit', site.timeLimit.toString());
        if (site.createdAt) params.append('createdAt', site.createdAt.toString());
        
        // For time limit sites that have reached their limit, add a parameter
        if (site.type === 'timeLimit' && site.limitReached) {
          params.append('limitReached', 'true');
        }
        
        const redirectUrl = `/blocked.html?${params.toString()}`;
        
        // Create a rule for each pattern
        urlPatterns.forEach(pattern => {
          newRules.push({
            id: ruleIdCounter++,
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                extensionPath: redirectUrl
              }
            },
            condition: {
              urlFilter: pattern,
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
            }
          });
        });
      });

    if (newRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: newRules
      });
      console.log('Updated blocking rules:', newRules);
    } else {
      console.log('No active sites to block');
    }
  } catch (error) {
    console.error('Error updating dynamic rules:', error);
  }
}

// Function to redirect active tabs of a site that just reached its time limit
async function redirectActiveTabsForSite(site: BlockedSite) {
  try {
    // Get all tabs
    const tabs = await chrome.tabs.query({});
    
    // Create site domain pattern for matching
    let siteDomain = site.url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
    
    // Find tabs matching the site domain
    for (const tab of tabs) {
      if (tab.url && tab.url.startsWith('http')) {
        try {
          const tabUrl = new URL(tab.url);
          const tabDomain = tabUrl.hostname.replace(/^www\./, '');
          
          // Check if this tab is for the site that reached its limit
          const isMatchingSite = 
            tabDomain === siteDomain || 
            tabDomain.endsWith(`.${siteDomain}`) || 
            siteDomain.endsWith(`.${tabDomain}`);
          
          if (isMatchingSite) {
            console.log(`Redirecting tab ${tab.id} to blocked page for ${site.url}`);
            
            // Create the redirect URL with parameters
            const params = new URLSearchParams();
            params.append('url', site.url);
            params.append('type', site.type);
            if (site.timeLimit) params.append('timeLimit', site.timeLimit.toString());
            if (site.createdAt) params.append('createdAt', site.createdAt.toString());
            params.append('limitReached', 'true');
            
            const redirectUrl = chrome.runtime.getURL(`/blocked.html?${params.toString()}`);
            
            // Update the tab to redirect to blocked page
            await chrome.tabs.update(tab.id!, { url: redirectUrl });
          }
        } catch (e) {
          // Skip tabs with invalid URLs
          console.error('Error processing tab URL:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error redirecting tabs:', error);
  }
}

// Function to load sites from storage and apply rules
async function loadAndApplyRules() {
  try {
    // Get from chrome.storage.local
    const chromeData = await chrome.storage.local.get('blockedSites');
    let blockedSites = chromeData.blockedSites || [];
    
    // Check if any sites need daily reset
    let needsUpdate = false;
    blockedSites = blockedSites.map((site: BlockedSite) => {
      if (site.type === 'timeLimit' && shouldResetTimeLimit(site)) {
        needsUpdate = true;
        return resetTimeLimitTracking(site);
      }
      return site;
    });
    
    // Save updates if needed
    if (needsUpdate) {
      await chrome.storage.local.set({ blockedSites });
    }
    
    console.log('Loaded blocked sites from storage:', blockedSites);
    await updateDynamicRules(blockedSites);
  } catch (error) {
    console.error('Error loading blocked sites:', error);
  }
}

// Listen for storage changes to update rules and handle already open tabs
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'local' && changes.blockedSites) {
    const oldSites = changes.blockedSites.oldValue || [];
    const newSites = changes.blockedSites.newValue || [];
    
    // Check for newly added time-limited sites
    const newlyAddedTimeLimitSites = newSites.filter((newSite: BlockedSite) => {
      return newSite.type === 'timeLimit' && 
             !oldSites.some((oldSite: BlockedSite) => oldSite.id === newSite.id);
    });
    
    // If there are newly added time-limited sites, check for already open tabs
    if (newlyAddedTimeLimitSites.length > 0) {
      console.log('New time-limited sites added, checking for open tabs:', newlyAddedTimeLimitSites);
      await handleAlreadyOpenTabs(newlyAddedTimeLimitSites);
    }
    
    // Update blocking rules
    updateDynamicRules(newSites);
  }
});

// Function to handle already open tabs when a new site is added
async function handleAlreadyOpenTabs(newSites: BlockedSite[]) {
  try {
    // Get all open tabs
    const tabs = await chrome.tabs.query({});
    let needsUpdate = false;
    
    // Get the current list of blocked sites
    const chromeData = await chrome.storage.local.get('blockedSites');
    let blockedSites = chromeData.blockedSites || [];
    
    // Check each new site against open tabs
    for (const site of newSites) {
      // Get domain from site URL
      let siteDomain = site.url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      
      // Check each tab to see if it matches the site
      for (const tab of tabs) {
        if (tab.url && tab.url.startsWith('http')) {
          try {
            const tabUrl = new URL(tab.url);
            const tabDomain = tabUrl.hostname.replace(/^www\./, '');
            
            // Check if this tab is for this site
            const isMatchingSite = 
              tabDomain === siteDomain || 
              tabDomain.endsWith(`.${siteDomain}`) || 
              siteDomain.endsWith(`.${tabDomain}`);
            
            if (isMatchingSite) {
              console.log(`Found already open tab for newly added site ${site.url}:`, tab);
              
              // Update the site to mark it as active
              const siteIndex = blockedSites.findIndex((s: BlockedSite) => s.id === site.id);
              if (siteIndex !== -1) {
                blockedSites[siteIndex] = {
                  ...blockedSites[siteIndex],
                  isActive: true,
                  lastVisitTime: Date.now()
                };
                needsUpdate = true;
                
                console.log(`Marked site ${site.url} as active because tab was already open`);
              }
            }
          } catch (e) {
            // Skip tabs with invalid URLs
            console.error('Error processing tab URL:', e);
          }
        }
      }
    }
    
    // Save updates if needed
    if (needsUpdate) {
      await chrome.storage.local.set({ blockedSites });
    }
  } catch (error) {
    console.error('Error handling already open tabs:', error);
  }
}

// Function to update usage time for active sites
async function updateUsageTime() {
  try {
    const chromeData = await chrome.storage.local.get('blockedSites');
    let blockedSites = chromeData.blockedSites || [];
    
    // Get current timestamp
    const now = Date.now();
    let needsUpdate = false;
    let sitesNeedingRedirect: BlockedSite[] = [];
    
    // Check for sites that need daily reset
    blockedSites = blockedSites.map((site: BlockedSite) => {
      // Check if this site needs a daily reset
      if (site.type === 'timeLimit' && shouldResetTimeLimit(site)) {
        needsUpdate = true;
        return resetTimeLimitTracking(site);
      }
      
      // Update usage time for active time-limit sites
      if (site.type === 'timeLimit' && site.isActive && site.lastVisitTime && !site.limitReached) {
        // Calculate elapsed time since last check in minutes
        const elapsedMinutes = (now - site.lastVisitTime) / (1000 * 60);
        
        // Update usage time (initialize if not set)
        site.usageTime = (site.usageTime || 0) + elapsedMinutes;
        site.lastVisitTime = now;
        
        // Safe access to timeLimit, which might be undefined
        const timeLimit = site.timeLimit || 0;
        console.log(`Updated usage time for ${site.url}: ${site.usageTime.toFixed(2)}/${timeLimit} minutes`);
        
        // Check if time limit has been reached
        if (site.timeLimit && site.usageTime >= site.timeLimit) {
          console.log(`Time limit reached for ${site.url}`);
          site.limitReached = true;
          
          // Queue this site for immediate tab redirection
          sitesNeedingRedirect.push(site);
        }
        
        needsUpdate = true;
      }
      
      return site;
    });
    
    // Save updates if needed
    if (needsUpdate) {
      await chrome.storage.local.set({ blockedSites });
      
      // Update blocking rules to apply new states
      await updateDynamicRules(blockedSites);
      
      // Redirect active tabs for sites that just reached their limit
      for (const site of sitesNeedingRedirect) {
        await redirectActiveTabsForSite(site);
      }
    }
  } catch (error) {
    console.error('Error updating usage time:', error);
  }
}

// Track site visits using webNavigation API
chrome.webNavigation.onCompleted.addListener(async (details) => {
  // Only process main frame navigations (top-level page loads)
  if (details.frameId !== 0) return;
  
  try {
    const url = new URL(details.url);
    const domain = url.hostname;
    
    console.log(`Navigation completed to: ${domain}`);
    
    // Get blocked sites
    const chromeData = await chrome.storage.local.get('blockedSites');
    let blockedSites = chromeData.blockedSites || [];
    let needsUpdate = false;
    
    // Update active status for all sites
    blockedSites = blockedSites.map((site: BlockedSite) => {
      // Check if this site needs a daily reset
      if (site.type === 'timeLimit' && shouldResetTimeLimit(site)) {
        site = resetTimeLimitTracking(site);
        needsUpdate = true;
      }
      
      // Extract hostname from the site URL for comparison
      let siteHostname = site.url;
      try {
        // Remove protocol and path if present
        siteHostname = siteHostname.replace(/^https?:\/\//, '');
        siteHostname = siteHostname.split('/')[0];
        // Remove www. if present
        siteHostname = siteHostname.replace(/^www\./, '');
      } catch (e) {
        // If parsing fails, keep original value
      }
      
      // Clean up the current domain for comparison
      let cleanDomain = domain.replace(/^www\./, '');
      
      // Check if navigation is to this blocked site
      const isMatchingSite = 
        cleanDomain === siteHostname || 
        cleanDomain.endsWith(`.${siteHostname}`) || 
        siteHostname.endsWith(`.${cleanDomain}`);
      
      if (site.type === 'timeLimit' && isMatchingSite && !site.limitReached) {
        // If this is the first visit or reactivation, mark as active
        if (!site.isActive) {
          console.log(`User started visiting ${site.url}`);
          site.isActive = true;
          site.lastVisitTime = Date.now();
          needsUpdate = true;
        }
      }
      
      return site;
    });
    
    // Save updates if needed
    if (needsUpdate) {
      await chrome.storage.local.set({ blockedSites });
    }
  } catch (error) {
    console.error('Error tracking site visit:', error);
  }
});

// Track when user leaves a site
chrome.tabs.onUpdated.addListener(async (_, changeInfo, tab) => {
  // Only process when a tab completes loading and has a URL
  if (changeInfo.status !== 'complete' || !tab.url) return;
  
  try {
    const url = new URL(tab.url);
    
    // Ignore extension pages and non-http protocols
    if (!url.protocol.startsWith('http')) return;
    
    await checkAndUpdateActiveSites();
  } catch (error) {
    console.error('Error tracking tab update:', error);
  }
});

// Track when user closes a tab
chrome.tabs.onRemoved.addListener(async (tabId) => {
  console.log(`Tab ${tabId} was closed`);
  
  // Small delay to ensure all tab data is updated
  setTimeout(async () => {
    await checkAndUpdateActiveSites();
  }, 100);
});

// Function to check which sites are actually open and update their active status
async function checkAndUpdateActiveSites() {
  try {
    // Get blocked sites
    const chromeData = await chrome.storage.local.get('blockedSites');
    let blockedSites = chromeData.blockedSites || [];
    
    // Get all currently open tabs
    const allTabs = await chrome.tabs.query({});
    const openDomains = new Set<string>();
    
    // Collect all open domains
    for (const t of allTabs) {
      if (t.url && t.url.startsWith('http')) {
        try {
          const tabUrl = new URL(t.url);
          const domain = tabUrl.hostname.replace(/^www\./, '');
          openDomains.add(domain);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    console.log('Currently open domains:', Array.from(openDomains));
    
    // Update active status for all sites
    let needsUpdate = false;
    blockedSites = blockedSites.map((site: BlockedSite) => {
      if (site.type !== 'timeLimit') return site;
      
      // Extract clean domain from site URL
      let siteDomain = site.url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
      
      // Check if any open tab contains this domain
      const siteIsOpen = Array.from(openDomains).some(domain => 
        domain === siteDomain || 
        domain.endsWith(`.${siteDomain}`) || 
        siteDomain.endsWith(`.${domain}`)
      );
      
      // If site was active but is no longer open in any tab
      if (site.isActive && !siteIsOpen) {
        console.log(`User stopped visiting ${site.url}`);
        
        // Update usage time before marking inactive
        if (site.lastVisitTime) {
          const now = Date.now();
          const elapsedMinutes = (now - site.lastVisitTime) / (1000 * 60);
          site.usageTime = (site.usageTime || 0) + elapsedMinutes;
          
          console.log(`Final usage time update for ${site.url}: ${site.usageTime.toFixed(2)}/${site.timeLimit} minutes`);
          
          // Check if time limit reached
          if (site.timeLimit && site.usageTime >= site.timeLimit) {
            console.log(`Time limit reached for ${site.url}`);
            site.limitReached = true;
          }
        }
        
        // Mark as inactive
        site.isActive = false;
        needsUpdate = true;
      }
      
      return site;
    });
    
    // Save updates if needed
    if (needsUpdate) {
      await chrome.storage.local.set({ blockedSites });
      
      // Update blocking rules to apply new states
      await updateDynamicRules(blockedSites);
    }
  } catch (error) {
    console.error('Error checking active sites:', error);
  }
}

// Set up a timer to periodically update usage time for active sites
const UPDATE_INTERVAL = 5000; // Update every 5 seconds
setInterval(updateUsageTime, UPDATE_INTERVAL);

// Also check time limits when a navigation occurs
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only check main frame navigations
  if (details.frameId !== 0) return;
  
  // Update usage time before checking navigation
  await updateUsageTime();
}); 