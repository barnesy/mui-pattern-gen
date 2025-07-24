# Breadcrumb Navigation Test

## Test Steps:

1. Open http://localhost:5173/dashboard-example
2. Enable AI Design Mode (toggle in app bar)
3. Click on any LabelValuePair within a DataDisplayCard
4. Check the AI Design Mode drawer for breadcrumb navigation

## Expected Result:
- Should see breadcrumb like: "DataDisplayCard > labelValuePair-region"
- Clicking "DataDisplayCard" should select the parent card
- The breadcrumb should only appear when a sub-component is selected

## Debug Info:
- Check browser console for any errors
- Verify that `selectedPattern.isSubComponent` is true
- Verify that `selectedPattern.parentInstanceId` is set