# Admission Module Fixes & Audit Notes

## Root Cause Analysis (Fixed)
The application submission failures were caused by a mismatch between the backend service layer and the database schema.
- **Backend Expectation:** The code expects `candidate_type`, `reference_number`, and `external_applicant_snapshot` columns to exist.
- **Backend Expectation:** External candidates (no user ID) require `applicant_id` to be nullable.
- **Database Reality (Old):** These columns were missing, and `applicant_id` was NOT NULL.

## Fix Implementation
Aligned the database with the code via `backend/db/admission_phase1_extended.sql`.

### Required Database State
For the PET Admission module to function correctly, the `admission_applications` table **MUST** have:
- `applicant_id` (UUID, Nullable) -> Null for External
- `candidate_type` (VARCHAR, 'INTERNAL' | 'EXTERNAL')
- `reference_number` (VARCHAR, Unique)
- `external_applicant_snapshot` (JSONB)

### Configuration Hardening
- Backend default port set to `3003` to match Frontend expectation.
- Ensure strict port alignment to prevent CORS/Connection Refused errors.

### Frontend Polish
- Removed default `0` and `2024` values from the application form to improve UX.
- **API Robustness:** Rewrote `api.ts` to strictly align BaseURL and include robust Interceptors for logging and error handling.
- **Access Control:** Relaxed `/my-applications` RBAC check. It now allows any Authenticated User to view their own applications (Scoping is handled by User ID in the controller/service). This fixed the 403 Forbidden error for standard users.
