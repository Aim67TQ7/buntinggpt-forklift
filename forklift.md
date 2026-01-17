# Forklift Pre-Op Checklist - Technical Specification

## Overview

A mobile-first Progressive Web App (PWA) for forklift pre-operation safety inspections. Designed for iOS/Android deployment with multi-tenancy architecture for white-label company deployments.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query (React Query) |
| Backend | Supabase (PostgreSQL + Auth) |
| PWA | vite-plugin-pwa |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PWA Container                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   Index Page    │    │        Admin Page           │ │
│  │ (CompactChecklist)   │  (Passcode Protected)       │ │
│  └────────┬────────┘    └──────────────┬──────────────┘ │
│           │                            │                │
│           ▼                            ▼                │
│  ┌─────────────────────────────────────────────────────┐│
│  │              useForkliftData Hook                   ││
│  │  (TanStack Query mutations & queries)               ││
│  └────────────────────────┬────────────────────────────┘│
└───────────────────────────┼─────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│                      Supabase                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                   PostgreSQL                         │ │
│  │  • forklift_units                                    │ │
│  │  • forklift_checklist_questions                      │ │
│  │  • forklift_question_assignments (junction)          │ │
│  │  • forklift_checklist_submissions                    │ │
│  │  • forklift_checklist_responses                      │ │
│  │  • forklift_qualified_drivers                        │ │
│  │  • forklift_fail_notifications                       │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `forklift_units`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Display name (e.g., "Toyota #1") |
| unit_number | text | Asset ID |
| is_active | boolean | Soft delete flag |
| is_default | boolean | Auto-select on load (deprecated) |

### `forklift_checklist_questions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_text | text | Full question text |
| label | text | Short label for compact UI |
| category | text | Grouping category |
| sort_order | integer | Display order |
| is_active | boolean | Global enable/disable |

### `forklift_question_assignments`
Junction table for equipment-specific checklists.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| forklift_id | uuid | FK → forklift_units |
| question_id | uuid | FK → forklift_checklist_questions |

### `forklift_qualified_drivers`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| badge_number | text | Employee badge ID |
| driver_name | text | Display name |
| is_active | boolean | Authorization status |

### `forklift_checklist_submissions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| badge_number | text | Operator badge |
| forklift_id | uuid | FK → forklift_units |
| submitted_at | timestamptz | Submission time |
| has_failures | boolean | Quick failure flag |

### `forklift_checklist_responses`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| submission_id | uuid | FK → submissions |
| question_id | uuid | FK → questions |
| status | text | "pass", "fail", "na" |
| timestamp | timestamptz | Response time |
| admin_notes | text | Repair/follow-up notes |

### `forklift_fail_notifications`
Real-time failure alerts for admin.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| submission_id | uuid | FK → submissions |
| question_id | uuid | FK → questions |
| badge_number | text | Operator badge |
| forklift_name | text | Denormalized for display |
| question_text | text | Denormalized for display |
| is_read | boolean | Dismissal state |

---

## User Flows

### Operator Flow (Mobile)

```
┌──────────────────┐
│  Select Equipment │ ← Grid of equipment buttons
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Enter Badge ID  │ ← Real-time validation
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Complete Items  │ ← Toggle Yes/No per question
│  (2-column grid) │   Comment required on "No"
└────────┬─────────┘
         ▼
┌──────────────────┐
│     SUBMIT       │ ← Disabled until valid
└──────────────────┘
```

### Admin Flow (Desktop)

```
┌──────────────────┐
│  Passcode Entry  │ ← 4-digit PIN (default: 4155)
└────────┬─────────┘
         ▼
┌──────────────────────────────────────────────┐
│              Admin Dashboard                  │
│  ┌─────────┬─────────┬─────────┬───────────┐ │
│  │ History │Questions│ Drivers │ Forklifts │ │
│  └────┬────┴────┬────┴────┬────┴─────┬─────┘ │
│       │         │         │          │       │
│  View/Delete  Enable/   Add/Delete  Add/Edit │
│  Submissions  Disable   Operators   Units    │
│  + Add Notes  + Edit                + Assign │
│               Text                  Questions│
└──────────────────────────────────────────────┘
```

---

## Key Components

### `CompactChecklist.tsx`
Main operator interface. Handles:
- Equipment selection (button grid)
- Badge validation (debounced)
- Response collection
- Submission with failure notifications

### `ToggleChecklistItem.tsx`
Individual check item with:
- Yes/No toggle buttons
- Expandable comment field on "No"
- Compact 2-column grid layout

### `AdminPage.tsx`
Protected admin dashboard with:
- Failure notification banner
- Submission history with detail view
- Question management
- Driver management
- Equipment/question assignment

### `useForkliftData.ts`
Centralized data layer with TanStack Query:
- `useForklifts()` - Active equipment list
- `useForkliftQuestions(forkliftId)` - Equipment-specific questions
- `useValidateBadge()` - Driver authorization check
- `useSubmitChecklist()` - Full submission with notifications
- Admin mutations for CRUD operations

---

## PWA Configuration

```javascript
// vite.config.ts
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Forklift Pre-Op Checklist",
    short_name: "Forklift Check",
    theme_color: "#f97316",
    background_color: "#0a0a0a",
    display: "standalone",
    orientation: "portrait"
  },
  workbox: {
    runtimeCaching: [
      // Supabase API caching
      { urlPattern: /supabase\.co/, handler: "NetworkFirst" }
    ]
  }
})
```

---

## Security

| Feature | Implementation |
|---------|----------------|
| Admin Access | Client-side passcode (4-digit) |
| Driver Auth | Badge validation against `qualified_drivers` table |
| Mobile Restriction | Settings icon hidden on mobile (`hidden md:block`) |
| Data Access | Supabase RLS policies (table-level) |

---

## Multi-Tenancy Preparation

The architecture supports future multi-company deployment:

1. **Database**: Add `company_id` foreign key to all tables
2. **Auth**: Implement Supabase Auth with company-scoped sessions
3. **UI**: Company branding via CSS variables
4. **PWA**: Dynamic manifest per deployment

---

## File Structure

```
src/
├── components/
│   ├── forklift/
│   │   ├── AdminPage.tsx        # Admin dashboard
│   │   ├── CompactChecklist.tsx # Main operator UI
│   │   ├── ToggleChecklistItem.tsx
│   │   ├── DriversTab.tsx
│   │   ├── SettingsTab.tsx
│   │   ├── ChecklistHelpDialog.tsx
│   │   └── AdminHelpDialog.tsx
│   └── ui/                      # shadcn components
├── hooks/
│   └── useForkliftData.ts       # All Supabase queries/mutations
├── pages/
│   ├── Index.tsx                # → CompactChecklist
│   ├── Admin.tsx                # → AdminPage
│   └── NotFound.tsx
└── integrations/
    └── supabase/
        ├── client.ts
        └── types.ts             # Auto-generated
```

---

## Extensibility

The app is designed for equipment type expansion:

1. Add new unit to `forklift_units` (e.g., "Hoist #1")
2. Assign relevant questions via `forklift_question_assignments`
3. Unit appears automatically in equipment selection grid

No code changes required for new equipment types.
