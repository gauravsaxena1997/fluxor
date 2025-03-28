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

// Function to check if a time-limited block has expired
function isTimeLimitExpired(site: BlockedSite): boolean {
  if (site.type !== 'timeLimit' || !site.timeLimit) return false;
  
  const elapsedMinutes = (Date.now() - site.createdAt) / (1000 * 60);
  const isExpired = elapsedMinutes >= site.timeLimit;
  
  console.log(`Site ${site.url} time limit check: ${elapsedMinutes.toFixed(2)}/${site.timeLimit} minutes, expired: ${isExpired}`);
  return isExpired;
}

// Function to check if a site should be blocked now
function shouldBlockSite(site: BlockedSite): boolean {
  if (site.type === 'permanent') return true;
  
  if (site.type === 'timeLimit' && site.timeLimit) {
    return isTimeLimitExpired(site);
  }
  
  return false;
}

// Function to create a URL pattern from a domain
function createUrlPattern(domain: string): string {
  console.log(`Creating pattern for original domain: ${domain}`);
  
  // Remove any protocols
  let cleanDomain = domain.replace(/^https?:\/\//, '');
  
  // Remove paths and query strings
  cleanDomain = cleanDomain.split('/')[0].split('?')[0].split('#')[0];
  
  // Remove www. if present
  cleanDomain = cleanDomain.replace(/^www\./, '');
  
  console.log(`Cleaned domain: ${cleanDomain}`);
  
  // For very short domains like "x.com", create more specific patterns
  if (cleanDomain.length <= 5) {
    return `*://*.${cleanDomain}/*`;
  }
  
  // Create a pattern that matches the domain exactly or as a subdomain
  // We use a very permissive pattern to catch all variations
  return `*://*${cleanDomain}/*`;
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

    // Convert blocked sites to declarativeNetRequest rules
    const newRules = blockedSites
      .filter(site => shouldBlockSite(site))
      .flatMap((site, index) => {
        const urlPattern = createUrlPattern(site.url);
        console.log(`Creating block pattern for ${site.url}: ${urlPattern}`);
        
        // Create the redirect URL with parameters
        const params = new URLSearchParams();
        params.append('url', site.url);
        params.append('type', site.type);
        if (site.timeLimit) params.append('timeLimit', site.timeLimit.toString());
        if (site.createdAt) params.append('createdAt', site.createdAt.toString());
        const redirectUrl = `/blocked.html?${params.toString()}`;
        
        // For each site, create two rules with different patterns for better coverage
        return [
          {
            id: index * 2 + 1,
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                extensionPath: redirectUrl
              }
            },
            condition: {
              urlFilter: urlPattern,
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
            }
          },
          {
            id: index * 2 + 2, 
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
              redirect: {
                extensionPath: redirectUrl
              }
            },
            condition: {
              // Add an alternative pattern for better matching
              urlFilter: `*://*.${site.url}/*`,
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
            }
          }
        ] as chrome.declarativeNetRequest.Rule[];
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

// Function to load sites from storage and apply rules
async function loadAndApplyRules() {
  try {
    // Get from chrome.storage.local
    const chromeData = await chrome.storage.local.get('blockedSites');
    let blockedSites = chromeData.blockedSites || [];
    
    console.log('Loaded blocked sites from storage:', blockedSites);
    await updateDynamicRules(blockedSites);
  } catch (error) {
    console.error('Error loading blocked sites:', error);
  }
}

// Listen for storage changes to update rules
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.blockedSites) {
    const blockedSites = changes.blockedSites.newValue || [];
    updateDynamicRules(blockedSites);
  }
});

// Set up a timer to periodically check time limits
const CHECK_INTERVAL = 10000; // Check every 10 seconds
setInterval(async () => {
  try {
    console.log('Checking time limits...');
    const chromeData = await chrome.storage.local.get('blockedSites');
    const blockedSites = chromeData.blockedSites || [];
    
    // Check each site to see if its blocking status has changed
    let needsUpdate = false;
    blockedSites.forEach((site: BlockedSite) => {
      if (site.type === 'timeLimit') {
        // Site is time-limited, check if it has expired
        const wasExpired = site.hasOwnProperty('_lastCheckExpired') ? (site as any)._lastCheckExpired : false;
        const isExpired = isTimeLimitExpired(site);
        
        // If expiration status changed, we need to update
        if (wasExpired !== isExpired) {
          console.log(`Expiration status changed for ${site.url}: ${wasExpired} -> ${isExpired}`);
          (site as any)._lastCheckExpired = isExpired;
          needsUpdate = true;
        }
      }
    });
    
    if (needsUpdate) {
      console.log('Time limits have changed, updating rules');
      // Save the updated sites with their check status
      await chrome.storage.local.set({ blockedSites });
      // Update the blocking rules
      await updateDynamicRules(blockedSites);
    }
  } catch (error) {
    console.error('Error checking time limits:', error);
  }
}, CHECK_INTERVAL);

// Listen for navigation events to check if we need to block the site
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only check main frame navigations
  if (details.frameId !== 0) return;
  
  try {
    console.log(`Navigation detected to: ${details.url}`);
    const chromeData = await chrome.storage.local.get('blockedSites');
    const blockedSites = chromeData.blockedSites || [];
    
    // Check if any time-limited sites need to be updated
    let needsUpdate = false;
    
    blockedSites.forEach((site: BlockedSite) => {
      if (site.type === 'timeLimit') {
        // Check if this is a new expiration
        const wasExpired = site.hasOwnProperty('_lastCheckExpired') ? (site as any)._lastCheckExpired : false;
        const isExpired = isTimeLimitExpired(site);
        
        if (wasExpired !== isExpired) {
          console.log(`Navigation check: Expiration changed for ${site.url}: ${wasExpired} -> ${isExpired}`);
          (site as any)._lastCheckExpired = isExpired;
          needsUpdate = true;
        }
      }
    });
    
    if (needsUpdate) {
      console.log('Navigation triggered rule update due to time limit changes');
      // Save the updated sites with their check status
      await chrome.storage.local.set({ blockedSites });
      // Update the blocking rules
      await updateDynamicRules(blockedSites);
    }
  } catch (error) {
    console.error('Error checking navigation:', error);
  }
}); 