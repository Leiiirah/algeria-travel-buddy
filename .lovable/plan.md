

# Plan: Add Command Details View with Passport Display for Visa Services

## Overview

Add a dedicated "View Details" dialog for commands that displays all command information in a read-only format. For visa commands, this will include the ability to view and download the attached scanned passport.

---

## Current State

- Commands list shows basic info in the table
- "View" action currently opens the edit form (same as Edit)
- Passport upload exists for new visa commands only
- `getCommandPassportBlob` API method exists but is not used anywhere

---

## Solution

Create a new read-only details dialog that:
1. Shows all command information based on service type
2. For visa commands, displays the passport file if attached (view inline + download button)
3. Uses the existing authenticated blob fetching pattern for secure file access

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/CommandsPage.tsx` | Add details dialog with passport viewer |
| `src/i18n/locales/fr/commands.json` | Add new translation keys for details view |
| `src/i18n/locales/ar/commands.json` | Add Arabic translations |

---

## Implementation Details

### 1. Add Details Dialog State

Add new state variables:
```typescript
const [viewingCommand, setViewingCommand] = useState<Command | null>(null);
const [passportBlobUrl, setPassportBlobUrl] = useState<string | null>(null);
const [isLoadingPassport, setIsLoadingPassport] = useState(false);
```

### 2. Add Passport Loading Function

```typescript
const handleViewCommand = async (command: Command) => {
  setViewingCommand(command);
  setPassportBlobUrl(null);
  
  // If visa command with passport, load it
  if (command.passportUrl) {
    setIsLoadingPassport(true);
    try {
      const blob = await api.getCommandPassportBlob(command.id, 'view');
      const url = URL.createObjectURL(blob);
      setPassportBlobUrl(url);
    } catch (error) {
      console.error('Failed to load passport:', error);
    } finally {
      setIsLoadingPassport(false);
    }
  }
};

const handleDownloadPassport = async (commandId: string) => {
  try {
    const blob = await api.getCommandPassportBlob(commandId, 'download');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passport.pdf';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download passport:', error);
  }
};
```

### 3. Add Details Dialog Component

```tsx
<Dialog open={!!viewingCommand} onOpenChange={(open) => {
  if (!open) {
    setViewingCommand(null);
    if (passportBlobUrl) {
      URL.revokeObjectURL(passportBlobUrl);
      setPassportBlobUrl(null);
    }
  }
}}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{t('details.title')}</DialogTitle>
    </DialogHeader>
    
    {viewingCommand && (
      <div className="space-y-6">
        {/* Client Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">{t('table.client')}</Label>
            <p className="font-medium">{viewingCommand.data.clientFullName}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">{t('form.phone')}</Label>
            <p className="font-medium">{viewingCommand.data.phone || '-'}</p>
          </div>
        </div>
        
        {/* Service-specific fields */}
        {viewingCommand.data.type === 'visa' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">{t('form.firstName')}</Label>
              <p className="font-medium">{viewingCommand.data.firstName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('form.lastName')}</Label>
              <p className="font-medium">{viewingCommand.data.lastName}</p>
            </div>
          </div>
        )}
        
        {/* Passport Section - Only for Visa */}
        {viewingCommand.data.type === 'visa' && (
          <div className="border-t pt-4">
            <Label className="text-muted-foreground mb-2 block">{t('form.passport')}</Label>
            {viewingCommand.passportUrl ? (
              <div className="space-y-3">
                {isLoadingPassport ? (
                  <div className="flex items-center justify-center h-[300px] bg-muted rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : passportBlobUrl ? (
                  <>
                    {/* Display based on file type */}
                    {viewingCommand.passportUrl.endsWith('.pdf') ? (
                      <iframe
                        src={passportBlobUrl}
                        className="w-full h-[400px] rounded-lg border"
                        title="Passport Preview"
                      />
                    ) : (
                      <img
                        src={passportBlobUrl}
                        alt="Passport"
                        className="max-w-full max-h-[400px] rounded-lg border mx-auto"
                      />
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPassport(viewingCommand.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('form.downloadPassport')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-destructive">{t('details.passportLoadError')}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('form.noPassport')}</p>
            )}
          </div>
        )}
        
        {/* Financial Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">{t('form.accountingInfo')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">{t('table.sellingPrice')}</Label>
              <p className="font-medium">{formatDZD(viewingCommand.sellingPrice)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('table.payment')}</Label>
              <p className="font-medium">{formatDZD(viewingCommand.amountPaid)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('table.remaining')}</Label>
              <p className="font-medium text-red-600">{formatDZD(remaining)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t('table.profit')}</Label>
              <p className="font-medium text-green-600">{formatDZD(profit)}</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
```

### 4. Update View Action in Table

Change the dropdown menu "View" action to call `handleViewCommand` instead of `handleEditCommand`:

```tsx
<DropdownMenuItem onClick={() => handleViewCommand(command)}>
  <Eye className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
  {tCommon('actions.view')}
</DropdownMenuItem>
```

### 5. Add New Translations

**French (`fr/commands.json`)**:
```json
{
  "details": {
    "title": "Détails de la commande",
    "passportLoadError": "Impossible de charger le passeport"
  }
}
```

**Arabic (`ar/commands.json`)**:
```json
{
  "details": {
    "title": "تفاصيل الطلب",
    "passportLoadError": "فشل تحميل جواز السفر"
  }
}
```

---

## Visual Preview

```
┌────────────────────────────────────────────────────────────────┐
│ Détails de la commande                                    [X] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Client                          Téléphone                     │
│  Mohammed Benali                 +213 555 123 456              │
│                                                                │
│  Prénom                          Nom                           │
│  Mohammed                        Benali                        │
│                                                                │
│  ──────────────────────────────────────────────────────────   │
│  Passeport scanné                                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │           [Passport Image/PDF Preview]                   │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│  [📥 Télécharger le passeport]                                │
│                                                                │
│  ──────────────────────────────────────────────────────────   │
│  Informations comptables                                       │
│                                                                │
│  Prix de vente    Versement      Reste         Bénéfice       │
│  85 000 DZD       25 000 DZD     60 000 DZD    15 000 DZD    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Category | Count |
|----------|-------|
| Frontend pages | 1 |
| Translation files | 2 |
| **Total** | 3 files |

This implementation:
1. Creates a dedicated read-only details view dialog
2. Shows all command information based on service type
3. For visa commands, displays the scanned passport inline (PDF in iframe, images directly)
4. Provides download button for the passport
5. Uses authenticated blob fetching for secure access
6. Properly revokes blob URLs when dialog closes (memory management)

