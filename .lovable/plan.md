

# Isolate Remixed Project from Original El Hikma

## Problem
This remixed project contains the original deployment configuration. If connected to GitHub:
- **deploy.yml** will overwrite the original El Hikma website on your VPS
- **API URL** points to the original backend, so both projects share the same data
- **Agency branding** still shows El Hikma details

## Plan

### Step 1: Disable or update deploy.yml
**Option A (Recommended now):** Delete the deploy.yml file entirely until you set up a separate deployment pipeline for the new instance.

**Option B:** Update it for the new instance — but this requires you to first set up the new backend on your VPS (new folder, new port, new database, new PM2 process).

### Step 2: Update API URL
Change `src/lib/api.ts` to point to the new backend once it's deployed. For now, we can set a placeholder or environment variable so it doesn't accidentally hit the original.

### Step 3: Update agency branding
Update `src/constants/agency.ts` with the new agency's name, address, phone, email, bank details, and Arabic translations.

### What I'll do now (with your approval)
1. **Delete `.github/workflows/deploy.yml`** to prevent accidental deployment to the original server
2. **Update `src/lib/api.ts`** — change the default URL to a placeholder like `http://localhost:8080/api` so it won't hit the original backend until you configure the new one
3. **Clear agency info** in `src/constants/agency.ts` — replace El Hikma details with placeholder values you can fill in later

### What you'll need to do on your VPS (separately)
Once you're ready to deploy the new instance:
1. Create a new folder (e.g., `/var/www/newagency`)
2. Create a new PostgreSQL database
3. Deploy the NestJS backend on a new port (e.g., 8081)
4. Start a new PM2 process
5. Configure Nginx for the new domain/subdomain
6. Then update the API URL and deploy.yml in this project to match

### Files Changed

| File | Change |
|---|---|
| `.github/workflows/deploy.yml` | Delete to prevent deploying to original server |
| `src/lib/api.ts` | Change default API URL to placeholder |
| `src/constants/agency.ts` | Replace El Hikma branding with placeholders |

