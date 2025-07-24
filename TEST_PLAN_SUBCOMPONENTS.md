# Sub-Component Selection Test Plan

## Overview
This test plan covers the new sub-component selection feature in AI Design Mode, which allows users to select and edit individual sub-components within patterns.

## Test Environment Setup
1. Start the development server: `npm run dev`
2. Navigate to http://localhost:5173/dashboard-example
3. Enable AI Design Mode using the toggle in the app bar

## Test Scenarios

### 1. Basic Sub-Component Selection
**Steps:**
1. With AI Design Mode enabled, navigate to Dashboard Example
2. Hover over a DataDisplayCard that contains stats or label-value pairs
3. Notice the purple outline around the entire card
4. Hover over individual LabelValuePair components within the card
5. Notice the subtle dashed outline on hover

**Expected Results:**
- ✓ Entire card shows purple outline when hovering over empty areas
- ✓ Individual LabelValuePairs show dashed outline on hover
- ✓ Cursor changes to pointer when hovering over selectable sub-components

### 2. Sub-Component Click Selection
**Steps:**
1. Click on an individual LabelValuePair within a DataDisplayCard
2. Observe the AI Design Mode drawer

**Expected Results:**
- ✓ The clicked LabelValuePair gets a solid purple outline
- ✓ The drawer title shows the sub-component name (e.g., "labelValuePair-region")
- ✓ The drawer shows "subcomponent" as the status
- ✓ Parent card outline is not shown when sub-component is selected

### 3. Parent vs Sub-Component Selection
**Steps:**
1. Click on a LabelValuePair to select it
2. Click on an empty area of the same DataDisplayCard
3. Click back on the LabelValuePair

**Expected Results:**
- ✓ Clicking empty area selects the parent DataDisplayCard
- ✓ Drawer shows "DataDisplayCard" with full pattern controls
- ✓ Clicking LabelValuePair again selects just that sub-component

### 4. Multiple Cards with Sub-Components
**Steps:**
1. Navigate to a page with multiple DataDisplayCards
2. Select a sub-component in the first card
3. Select a sub-component in a different card

**Expected Results:**
- ✓ Previous selection is cleared
- ✓ New sub-component is highlighted
- ✓ Drawer updates to show new selection

### 5. Nested Selection Behavior
**Steps:**
1. Find a DataDisplayCard with the "mixed" variant containing multiple sections
2. Click on different LabelValuePairs in the stats section
3. Click on the parent card

**Expected Results:**
- ✓ Each LabelValuePair can be selected individually
- ✓ Parent card can still be selected by clicking empty areas
- ✓ Selection state is properly maintained

### 6. Visual Feedback
**Steps:**
1. Enable AI Design Mode
2. Slowly move mouse across different patterns and sub-components

**Expected Results:**
- ✓ Hover states are smooth and responsive
- ✓ Outlines don't flicker or disappear unexpectedly
- ✓ Selected state persists until another selection is made

### 7. Edge Cases
**Steps:**
1. Try selecting a sub-component and then disabling AI Design Mode
2. Re-enable AI Design Mode
3. Try selecting sub-components in different pattern types

**Expected Results:**
- ✓ Selection is cleared when AI Design Mode is disabled
- ✓ No visual artifacts remain after disabling
- ✓ Sub-components only work in patterns that implement SubComponentWrapper

## Known Limitations
1. Sub-component prop editing is not yet implemented (shows props but can't edit)
2. Only LabelValuePair components in DataDisplayCard are wrapped
3. No breadcrumb navigation in drawer for component hierarchy

## Performance Tests
1. **Hover Performance**: Move mouse rapidly across many sub-components
   - Expected: No lag or stuttering
   
2. **Selection Performance**: Click rapidly between different sub-components
   - Expected: Selections update immediately
   
3. **Memory Usage**: Select/deselect many sub-components
   - Expected: No memory leaks, instances properly cleaned up

## Browser Compatibility
Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Accessibility
- [ ] Keyboard navigation works (Tab through components)
- [ ] Screen readers announce component selection
- [ ] Focus indicators are visible

## Test Results Log
Date: ___________
Tester: ___________
Version: ___________

| Test Case | Pass/Fail | Notes |
|-----------|-----------|--------|
| Basic Selection | | |
| Click Selection | | |
| Parent vs Sub | | |
| Multiple Cards | | |
| Nested Selection | | |
| Visual Feedback | | |
| Edge Cases | | |
| Performance | | |

## Issues Found
List any bugs or unexpected behaviors:
1. 
2. 
3. 

## Recommendations
List any improvements or enhancements suggested during testing:
1. 
2. 
3.