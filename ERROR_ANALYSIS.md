# Binary5 Frontend Errors - Complete Analysis

## Date: March 19, 2026

---

## Error 1: Missing Icon Files (PWA Manifest)

### Error Message
```
GET https://binary5-dev-tsb3.vercel.app/icon-192.png 404 (Not Found)
Error while trying to use the following icon from the Manifest: https://binary5-dev-tsb3.vercel.app/icon-192.png 
(Download error or resource isn't a valid image)
```

### Root Cause
The `manifest.json` file references icon files that don't exist in the public directory:
- `/icon-192.png` 
- `/icon-512.png`

**Location:** `frontend/public/manifest.json` (lines 9-17)

### Impact
- PWA installation won't display correct icons
- Browser console shows 404 error
- User experience degraded for PWA installations

### Solution
**Option A (Recommended):** Generate and add icon files
1. Create `frontend/public/icon-192.png` (192x192 pixels)
2. Create `frontend/public/icon-512.png` (512x512 pixels)

**Option B:** Use placeholder icons from existing assets
- Use SVG or PNG converter to generate from existing `assets/` images

**Option C:** Update manifest.json to use icon from web
```json
"icons": [
  {
    "src": "https://cdn.example.com/icon-192.png",
    "sizes": "192x192",
    "type": "image/png"
  }
]
```

---

## Error 2: Worker Profile API - 400 Bad Request

### Error Message
```
GET https://binary5-dev-production.up.railway.app/api/workers/worker-001 400 (Bad Request)
```

### Root Cause
The frontend is sending `worker-001` (string ID) to the backend API, but the backend expects a **UUID**.

**Issue Location:**
- **Frontend:** `frontend/lib/api.ts` line 88
  - Mock data uses ID: `"worker-001"` (not a UUID)
  - Endpoint: `GET /api/workers/worker-001`

- **Backend:** `backend/src/routes/workers.ts` lines 98-104
  - Route definition: `GET /:id`
  - Validation: `param('id').isUUID()` — **requires UUID format**

### Why It Fails
```
"worker-001" ✗ Not a UUID
"550e8400-e29b-41d4-a716-446655440000" ✓ Valid UUID
```

### Solution
**Backend Option 1:** Make ID validation optional
```typescript
// Change from:
[param('id').isUUID().withMessage('Invalid worker ID')]
// To:
[param('id').trim().notEmpty().withMessage('Invalid worker ID')]
```

**Backend Option 2:** Allow both UUID and short IDs
```typescript
[param('id').custom((value) => {
  if (!value) throw new Error('Invalid worker ID');
  return true;
})]
```

**Frontend:** Use correct mock data with UUIDs
```typescript
export const MOCK_WORKER: Worker = {
  id: "550e8400-e29b-41d4-a716-446655440000", // Real UUID
  // ...
}
```

---

## Error 3: Get Policies Route Not Found - 404

### Error Message
```
GET https://binary5-dev-production.up.railway.app/api/policies?workerId=worker-001 404 (Not Found)
```

### Root Cause
The frontend is requesting policies with query parameters, but **no GET route exists for `/api/policies` with query parameters**.

**Issue Location:**
- **Frontend:** `frontend/lib/api.ts` line 125
  ```typescript
  const res = await api.get(`/api/policies?workerId=${workerId}`);
  ```

- **Backend:** `backend/src/routes/policies.ts`
  - Only routes: 
    - `POST /api/policies` (create policy)
    - `GET /api/policies/:id` (get by policy ID)
    - `POST /api/policies/:id/renew` (renew policy)
  - **Missing:** `GET /api/policies?workerId=xxx`

### Solution
**Backend:** Add GET route for policies by worker ID
```typescript
// Add this route to backend/src/routes/policies.ts
router.get(
  '/',
  [query('workerId').isUUID().optional()],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workerId } = req.query;
      
      if (!workerId) {
        return next(createError('workerId query parameter is required', 400));
      }

      const result = await query<Policy>(
        'SELECT * FROM policies WHERE worker_id = $1 ORDER BY created_at DESC',
        [workerId]
      );

      return res.json({ success: true, data: result.rows });
    } catch (err) {
      return next(err);
    }
  }
);
```

**Alternative:** Redirect frontend to use correct endpoint
```typescript
// In frontend/lib/api.ts
export async function getPolicies(workerId: string): Promise<Policy[] | null> {
  try {
    const res = await api.get(`/api/workers/${workerId}/policies`); // Use worker endpoint
    return res.data.data || res.data;
  } catch {
    return null;
  }
}
```

---

## Error 4: Cannot Read 'replace' Property - TypeError

### Error Message
```
Uncaught TypeError: Cannot read properties of undefined (reading 'replace')
    at 0~zo~gg9tg0ux.js:1:8324
```

### Root Cause
A component is trying to call `.replace()` on an undefined value.

**Likely Location:** Data transformation or formatting function
- In `frontend/lib/utils.ts` or 
- In a component rendering data (e.g., `dashboard/page.tsx`)

**Probable Cause:** One of these:
1. **API returns `null`** due to errors above
2. **Component assumes data exists** but it's undefined
3. **Mock data field missing** causing undefined reference

### Example Problematic Code
```typescript
// This will fail if policy is undefined
const formatted = policy.tier.replace('_', ' '); // ✗ policy is undefined
```

### Solution
**Frontend: Add defensive checks** in `dashboard/page.tsx`
```typescript
// Where the error occurs (lines 75-155)
// Ensure data exists before accessing properties:

const recentClaims = Array.isArray(claims) ? claims.slice(0, 3) : [];

// Safe access to nested properties:
const policyTier = policy?.tier?.replace?.('_', ' ') || 'N/A';
const workerName = worker?.name?.split(' ')?.[0] || 'Guest';
```

**Frontend: Check all mock data fields**
```typescript
// Ensure all fields that might be used are defined
export const MOCK_POLICY: Policy = {
  id: "pol-001",
  tier: "standard", // Must not be undefined
  basePremium: 65,
  adjustedPremium: 82,
  maxWeeklyPayout: 1000,
  coverageEnd: "2026-03-24",
  status: "active",
};
```

---

## Summary Table

| Error | Type | Severity | Root Cause | Solution |
|-------|------|----------|-----------|----------|
| Icon 404 | Missing Assets | Medium | Icon files not in public/ | Add PNG files to public/ |
| Worker 400 | API Validation | High | UUID validation on non-UUID ID | Fix ID format or backend validation |
| Policies 404 | Missing Route | High | GET /api/policies?workerId route doesn't exist | Add backend route or use /workers/:id/policies |
| Replace TypeError | Data Handling | High | Undefined data causing property access error | Add null checks and defensive coding |

---

## Recommended Fix Priority

1. **HIGH:** Fix the policies route (prevents data loading)
2. **HIGH:** Fix worker ID validation (prevents profile loading)
3. **HIGH:** Fix the undefined property error (prevents rendering)
4. **MEDIUM:** Add icon files (PWA enhancement)

---

## Testing Checklist

After fixes:
- [ ] Check browser console for 404 errors
- [ ] Verify `/dashboard` page loads without errors
- [ ] Verify worker profile loads correctly
- [ ] Verify policies load in policy selector
- [ ] Verify PWA icons display correctly
- [ ] Test with different worker IDs

