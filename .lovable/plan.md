

# Fix Commands Page Horizontal Overflow -- Root Cause

## Problem

The `overflow-x-hidden` on the inner `<main>` element is not effective because the parent `SidebarInset` component (which is also a `<main>` element) is a flex child with `flex-1` but **no `min-w-0` or `overflow-hidden`**. In CSS flexbox, a flex child's minimum width defaults to `auto` (the size of its content), so wide content like the commands table pushes the entire `SidebarInset` wider than the viewport, causing horizontal scroll on the whole page -- including the header.

## Solution

Two changes are needed:

### 1. `src/components/layout/DashboardLayout.tsx` -- Add `min-w-0 overflow-hidden` to `SidebarInset`

On line 36, change:
```
<SidebarInset className="flex flex-1 flex-col">
```
to:
```
<SidebarInset className="flex flex-1 flex-col min-w-0 overflow-hidden">
```

This constrains the `SidebarInset` flex child so its content cannot push the layout wider. The `min-w-0` allows the flex item to shrink below its content size, and `overflow-hidden` clips anything that overflows.

### 2. `src/components/layout/DashboardLayout.tsx` -- Ensure `<main>` also constrains

Keep the existing `overflow-x-hidden overflow-y-auto` on the inner main (line 38), but also add `min-w-0` for safety:
```
<main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-background p-3 sm:p-6">
```

## Why previous fixes didn't work

The `overflow-x-hidden` was applied to the inner `<main>` element, but the outer flex container (`SidebarInset`) had no width constraint. In flexbox, a child's content can push the parent wider unless `min-w-0` is set on the flex item. The table content was pushing `SidebarInset` wider, which in turn pushed the entire page wider, making the header scroll too.

## Files changed

| File | Change |
|------|--------|
| `src/components/layout/DashboardLayout.tsx` | Add `min-w-0 overflow-hidden` to `SidebarInset`, add `min-w-0` to inner `<main>` |

This is a 2-line change that fixes the root cause for ALL pages, not just Commands.

