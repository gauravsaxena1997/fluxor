# Fluxor Test Cases

This document outlines comprehensive test cases for Fluxor's main features. These test cases are designed to validate functionality, edge cases, and user interactions.

## 1. Quick Links

### Basic Functionality
- [ ] TC-QL-001: Add a new link with valid URL and title
- [ ] TC-QL-002: Add a new link with empty title (should use domain as title)
- [ ] TC-QL-003: Verify error message when adding invalid URL
- [ ] TC-QL-004: Verify links persist after page refresh
- [ ] TC-QL-005: Verify favicon fetching for various domains

### Link Management
- [ ] TC-QL-006: Edit an existing link's title
- [ ] TC-QL-007: Edit an existing link's URL
- [ ] TC-QL-008: Delete a link and confirm it's removed
- [ ] TC-QL-009: Reorder links via drag-and-drop
- [ ] TC-QL-010: Verify link order persists after refresh

### Categories
- [ ] TC-QL-011: Create a new category
- [ ] TC-QL-012: Move links between categories
- [ ] TC-QL-013: Delete a category (with confirmation)
- [ ] TC-QL-014: Rename a category
- [ ] TC-QL-015: Collapse/expand categories

### Interactions
- [ ] TC-QL-016: Click a link and verify it opens in a new tab
- [ ] TC-QL-017: Use keyboard navigation to select and open links
- [ ] TC-QL-018: Verify mouse hover effects and tooltips
- [ ] TC-QL-019: Test mobile touch interactions
- [ ] TC-QL-020: Verify accessibility for screen readers

## 2. Focus Warden

### Site Blocking - Permanent
- [ ] TC-FW-001: Add a site to permanent block list with valid URL
- [ ] TC-FW-002: Verify error message when adding invalid URL
- [ ] TC-FW-003: Verify error when adding duplicate site
- [ ] TC-FW-004: Verify URL normalization (www.example.com = example.com)
- [ ] TC-FW-005: Verify permanent blocks persist after browser restart

### Site Blocking - Time Limited
- [ ] TC-FW-006: Add a site with 5-minute time limit
- [ ] TC-FW-007: Verify error for zero or negative time values
- [ ] TC-FW-008: Toggle between permanent/time-limited modes
- [ ] TC-FW-009: Verify time limit input auto-focus when selecting time limit mode
- [ ] TC-FW-010: Add time limits with various durations (1min, 30min, 2hrs)

### Popup Management
- [ ] TC-FW-011: Open management popup and verify both tabs show correct counts
- [ ] TC-FW-012: Delete a site from the permanent tab
- [ ] TC-FW-013: Delete a site from the time-limited tab
- [ ] TC-FW-014: Verify delete confirmation dialog appears
- [ ] TC-FW-015: Cancel deletion and verify site remains
- [ ] TC-FW-016: Confirm deletion and verify site is removed
- [ ] TC-FW-017: Test ESC key to close popup
- [ ] TC-FW-018: Test clicking backdrop to close popup
- [ ] TC-FW-019: Test close button functionality
- [ ] TC-FW-020: Test refresh button updates time data

### Time Tracking
- [ ] TC-FW-021: Visit site with time limit and verify counter starts
- [ ] TC-FW-022: Verify time spent updates correctly while browsing
- [ ] TC-FW-023: Close tab and verify timer stops
- [ ] TC-FW-024: Reopen site and verify timer continues from previous point
- [ ] TC-FW-025: Verify daily reset at midnight
- [ ] TC-FW-026: Test time progress display in popup
- [ ] TC-FW-027: Test refresh button updates usage time immediately

### Blocking Behavior
- [ ] TC-FW-028: Verify permanent block shows blocking page immediately
- [ ] TC-FW-029: Verify time-limited site allows access until limit reached
- [ ] TC-FW-030: Verify site blocks when time limit is exceeded
- [ ] TC-FW-031: Test subdomains are properly blocked (sub.example.com when example.com is blocked)
- [ ] TC-FW-032: Test redirection of open tabs when site is newly blocked
- [ ] TC-FW-033: Test active tab redirect when time limit is reached while browsing

### Edge Cases
- [ ] TC-FW-034: Test with site already open when adding to block list
- [ ] TC-FW-035: Test with multiple tabs of same site open
- [ ] TC-FW-036: Test browser restart with active time-limited sessions
- [ ] TC-FW-037: Test rapid tab opening/closing behavior
- [ ] TC-FW-038: Test time tracking in private/incognito mode
- [ ] TC-FW-039: Test with very large number of blocked sites (50+)
- [ ] TC-FW-040: Test blocking behavior during network connectivity issues

### Data Integrity
- [ ] TC-FW-041: Verify data saved to chrome.storage.local
- [ ] TC-FW-042: Verify data sync between popup and extension
- [ ] TC-FW-043: Test blocking list import/export (if implemented)
- [ ] TC-FW-044: Test data persistence across browser updates

### UI/UX
- [ ] TC-FW-045: Verify correct stats display (permanent/time-limited counts)
- [ ] TC-FW-046: Test responsive layout on various screen sizes
- [ ] TC-FW-047: Test dark/light theme support
- [ ] TC-FW-048: Verify appropriate favicon display in popup site list
- [ ] TC-FW-049: Test time progress bar visual accuracy
- [ ] TC-FW-050: Verify accessibility of all interactive elements

### Performance
- [ ] TC-FW-051: Measure popup open/close performance
- [ ] TC-FW-052: Test blocking rule application time
- [ ] TC-FW-053: Test CPU/memory usage during active blocking
- [ ] TC-FW-054: Test performance with many simultaneous blocked sites
- [ ] TC-FW-055: Verify no performance impact on non-blocked browsing 