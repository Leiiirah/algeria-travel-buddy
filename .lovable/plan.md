
# Plan: Replace Logo and Favicon

## Overview

Replace the current El Hikma logo and favicon with the new logo image you provided.

---

## Current State

| Location | Current Setup |
|----------|---------------|
| Logo (`src/assets/logo-elhikma.png`) | Used in LoginPage and AppSidebar |
| Favicon (`public/favicon.ico`) | Default favicon (no custom link tag in index.html) |

---

## Implementation

### Step 1: Copy New Logo to Assets Directory

Replace the existing logo file:
```
user-uploads://WhatsApp_Image_2026-01-20_at_17.03.35.jpeg 
  → src/assets/logo-elhikma.png
```

### Step 2: Copy New Logo for Favicon

Copy the image to public directory for favicon use:
```
user-uploads://WhatsApp_Image_2026-01-20_at_17.03.35.jpeg 
  → public/favicon.png
```

### Step 3: Update index.html

Add favicon link tag in the `<head>` section:
```html
<link rel="icon" href="/favicon.png" type="image/png">
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/assets/logo-elhikma.png` | Replace with new image |
| `public/favicon.png` | Copy new image as favicon |
| `index.html` | Add favicon link tag |

---

## Result

After the changes:
- ✅ Login page logo updated
- ✅ Sidebar logo updated  
- ✅ Browser tab favicon updated
