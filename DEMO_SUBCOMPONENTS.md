# Sub-Component Selection Demo Guide

## Quick Start Demo

### 1. Start the Application
```bash
npm install  # If not already done
npm run dev
```

### 2. Navigate to Dashboard Example
- Open http://localhost:5173/dashboard-example
- You should see a dashboard with various cards displaying metrics

### 3. Enable AI Design Mode
- Click the "AI" toggle in the top app bar
- Purple outlines will appear around patterns

### 4. Try Sub-Component Selection

#### Demo 1: Stats Cards (Top Row)
1. Hover over "Total Users" card - see purple outline around entire card
2. Hover over the number "$125,430" - see dashed outline around just that metric
3. Click on the metric - it gets selected individually
4. Look at the AI Design drawer - it shows "labelValuePair-total-revenue"

#### Demo 2: Mixed Content Card
1. Find a card with multiple label-value pairs
2. Click on "Region: North America" 
3. Notice only that specific line is selected
4. Click on "Growth Rate: +15.2%" 
5. Selection switches to just that component

#### Demo 3: Parent vs Child Selection
1. Click on any label-value pair to select it
2. Click on empty space within the same card
3. Now the entire DataDisplayCard is selected
4. Click back on a label-value pair - back to sub-component selection

#### Demo 4: Breadcrumb Navigation
1. Click on a label-value pair to select it
2. Look at the AI Design drawer - you'll see "Parent Component > labelValuePair-..."
3. Click "Parent Component" in the breadcrumb
4. Now the entire DataDisplayCard is selected
5. The breadcrumb disappears since you're at the top level

## What's Happening Behind the Scenes

1. **SubComponentWrapper** - Each LabelValuePair is wrapped with a special component that tracks selection
2. **Hierarchical Tracking** - The system knows which sub-components belong to which parent
3. **Smart Click Detection** - Clicks are intercepted and routed to the most specific component
4. **Visual Feedback** - CSS outlines provide clear selection indicators
5. **Breadcrumb Navigation** - Shows component hierarchy with clickable parent link

## Current Capabilities
- ✅ Select individual LabelValuePairs within DataDisplayCards
- ✅ Visual feedback for hover and selection states
- ✅ Proper parent-child relationship tracking
- ✅ Clean selection switching between components
- ✅ Breadcrumb navigation showing component hierarchy
- ✅ View sub-component properties in the drawer

## Coming Soon
- 🚧 Edit props for selected sub-components
- 🚧 Support for more sub-component types
- 🚧 Keyboard navigation support

## Try These Scenarios

1. **Rapid Selection**: Click quickly between different sub-components - selection should update instantly

2. **Cross-Card Selection**: Select a sub-component in one card, then select one in another card

3. **Stats vs Details**: In the revenue card, switch between selecting individual stats and the whole card

4. **Visual Polish**: Notice how outlines don't overlap or interfere with each other

## Troubleshooting

If sub-components aren't selectable:
1. Make sure AI Design Mode is enabled (toggle in app bar)
2. Ensure you're on the Dashboard Example page
3. Try refreshing the page
4. Check browser console for any errors

## Feedback Points

When testing, consider:
1. Is the selection behavior intuitive?
2. Are the visual indicators clear enough?
3. Would you want this for other component types?
4. Any confusion about what's selected?