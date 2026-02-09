

# Fix: Login Error Handling and Page Flicker

## Problem
When logging in with a non-existent email, the server returns a 401. The generic `request()` method in `api.ts` interprets this 401 as an expired session and:
1. Attempts a token refresh (which fails since there are no tokens)
2. Calls `window.location.href = '/login'` causing a full page reload (the flicker)
3. The error never reaches `LoginPage` to show the toast message

The `chrome-extension` and `content_script.js` errors in the console are from a browser extension and are completely unrelated to the app.

## Solution
Make the login API call bypass the automatic 401 token-refresh logic. There are two changes:

### 1. `src/lib/api.ts` -- Add a `skipAuthRetry` option

Add a flag to the `request()` method so that specific calls (like login) can opt out of the 401 refresh/redirect behavior. When a login attempt gets a 401, it should simply throw the `ApiError` with the server's message ("Invalid credentials") so that `AuthContext` can map it to a user-friendly message.

**How it works:**
- Add a 4th parameter `skipAuthRetry` (default `false`) to the private `request()` method
- When `skipAuthRetry` is true and the response is 401, skip the refresh attempt and the `window.location.href` redirect -- just throw the `ApiError` normally
- Update the `login()` method call to pass `skipAuthRetry: true`

### 2. `src/pages/LoginPage.tsx` -- Add inline error banner (optional UX improvement)

In addition to the toast, show a persistent inline error message at the top of the form so the user clearly sees what went wrong. This is better UX than a transient toast that can disappear.

**How it works:**
- Add a `loginError` state variable
- On failed login, set it to the error message
- Render a red alert banner above the form fields
- Clear it when the user starts typing again

## Files Changed

| File | Change |
|------|--------|
| `src/lib/api.ts` | Add `skipAuthRetry` parameter to `request()`, use it in `login()` call |
| `src/pages/LoginPage.tsx` | Add inline error banner for failed login attempts |

## Technical Details

**`src/lib/api.ts` changes:**

In the `request` method signature, add a 4th parameter:
```
private async request<T>(endpoint, options, isRetry = false, skipAuthRetry = false)
```

At line 639, change the condition to:
```
if (response.status === 401 && !isRetry && !skipAuthRetry) {
```

This means when `skipAuthRetry` is true, the 401 falls through to line 658 where it throws a normal `ApiError` with the server's error message -- exactly what the login flow needs.

Update the `login` method to pass the flag:
```
login = (data: LoginDto): Promise<LoginResponse> =>
  this.request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }, false, true);
```

**`src/pages/LoginPage.tsx` changes:**

Add a `loginError` state and render it as an inline alert:
- Red background banner with AlertCircle icon and the error message
- Displayed between the form title and the email field
- Cleared when user modifies email or password fields
- This complements the existing toast notification for better visibility

