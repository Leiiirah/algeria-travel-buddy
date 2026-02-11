

# Remove Documents Tab for Employees

## Overview
Hide the "Documents" navigation item from the sidebar for non-admin (employee) users, since the GED (electronic document management) is an admin-only feature.

## Change

**File:** `src/components/layout/AppSidebar.tsx`

Move the "Documents" menu item from `mainMenuItems` (visible to all) to `adminMenuItems` (visible to admins only). This means removing this entry from `mainMenuItems`:

```typescript
{
  titleKey: 'navigation.documents',
  url: '/documents',
  icon: FolderOpen,
}
```

And adding it to the `adminMenuItems` array instead.

No other files need to change -- the route protection is already handled by the existing role-based access patterns.

