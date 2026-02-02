
# Plan: Add Translations to Dashboard Page

## Overview

The Dashboard page currently has hardcoded French text, but the translation files already exist with both French and Arabic translations. We need to update `DashboardPage.tsx` to use the `useTranslation` hook from `react-i18next`.

---

## Current State

- ✅ Translation files exist: `fr/dashboard.json` and `ar/dashboard.json`
- ❌ `DashboardPage.tsx` uses hardcoded French strings

---

## Changes Required

### File to Modify

**`src/pages/DashboardPage.tsx`**

### Modifications

1. **Add import for `useTranslation`**
   ```typescript
   import { useTranslation } from 'react-i18next';
   ```

2. **Initialize translation hook**
   ```typescript
   const { t, i18n } = useTranslation('dashboard');
   ```

3. **Replace all hardcoded strings with translation keys:**

   | Current (Hardcoded) | Translation Key |
   |---------------------|-----------------|
   | `"Tableau de bord"` | `t('title')` |
   | `"Vue d'ensemble de votre agence"` | `t('subtitle')` |
   | `"Chiffre d'affaires"` | `t('stats.revenue')` |
   | `"Commandes du jour"` | `t('stats.todayCommands')` |
   | `"Nouvelles commandes aujourd'hui"` | `t('stats.todayCommandsDesc')` |
   | `"En cours"` | `t('stats.inProgress')` |
   | `"Commandes en traitement"` | `t('stats.inProgressDesc')` |
   | `"Impayés"` | `t('stats.unpaid')` |
   | `"Montant restant à percevoir"` | `t('stats.unpaidDesc')` |
   | `"Revenus de la semaine"` | `t('charts.weeklyRevenue')` |
   | `"Évolution des revenus sur 7 jours"` | `t('charts.weeklyRevenueDesc')` |
   | `"Répartition par service"` | `t('charts.serviceDistribution')` |
   | `"Distribution des commandes par type"` | `t('charts.serviceDistributionDesc')` |
   | `"Revenus"` (in tooltip) | `t('charts.revenues')` |
   | `"Part"` (in tooltip) | `t('charts.share')` |
   | `"Commandes récentes"` | `t('recentCommands.title')` |
   | `"Les 5 dernières commandes enregistrées"` | `t('recentCommands.subtitle')` |
   | `"Aucune commande récente"` | `t('recentCommands.empty')` |

4. **Update weekday names for charts to use translations:**
   ```typescript
   const weeklyData = stats?.weeklyData ?? [
     { name: t('weekDays.mon'), revenue: 45000 },
     { name: t('weekDays.tue'), revenue: 62000 },
     // ... etc
   ];
   ```

5. **Update date formatting to be locale-aware:**
   ```typescript
   new Date(command.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-DZ' : 'fr-FR')
   ```

---

## Summary

| File | Action |
|------|--------|
| `src/pages/DashboardPage.tsx` | Modify - Add translations |

This is a straightforward change that will make the Dashboard fully bilingual, matching the existing translation files.
