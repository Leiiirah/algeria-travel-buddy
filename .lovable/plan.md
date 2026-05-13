## Goal
Remove all Lovable branding from social-media link previews and the published site.

## Changes

### 1. Badge (done)
Already hidden the "Edit with Lovable" badge on published deployments via publish settings.

### 2. `index.html` — strip Lovable og:image and replace with your own branding
Currently the file references Lovable's preview image, which is what shows on WhatsApp/Twitter/LinkedIn/Facebook when sharing the link:

```html
<meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
<meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
```

Remove both lines. Two options for what to put instead:

- **Option A (recommended): no og:image at all.** Social platforms will fall back to a plain text preview (title + description) with no Lovable logo. Cleanest if you don't have a custom share image yet.
- **Option B: use your own image.** Add a 1200×630 PNG/JPG to `public/` (e.g. `public/og-image.png`) and reference it as `https://algeria-travel-buddy.lovable.app/og-image.png`.

### 3. Favicon — confirm it's already yours
`index.html` already points to `/favicon.png` (your own file in `public/`), not a Lovable favicon. No change needed unless you want a different icon — in that case upload the new image and I'll wire it up.

### 4. Optional polish while we're in `index.html`
- Add `<link rel="canonical" href="https://algeria-travel-buddy.lovable.app/" />` so shared links normalize to your domain.
- Add `<meta property="og:url" content="https://algeria-travel-buddy.lovable.app/" />`.

## What I need from you
1. Confirm Option A (no share image) or Option B (upload an image now).
2. Confirm the current `public/favicon.png` is yours and should stay, or upload a replacement.