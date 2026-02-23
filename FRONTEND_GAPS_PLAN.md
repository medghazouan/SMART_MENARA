# Frontend Implementation Gaps - SMART MENARA MVP

## Executive Summary
The frontend has **foundational components** (auth, basic dashboards, create panne form) but is missing **critical features** required by the PRD, specifically around notifications, detailed panne workflows, advanced analytics, and user interactions.

**Current Status:** ~35% MVP Complete  
**Estimated Gaps:** 17 major features/components

---

## 📊 CURRENT IMPLEMENTATION STATUS

### ✅ COMPLETED
- **Authentication**: Login page, auth context, token management
- **Pointeur Dashboard**: Lists declared pannes with stats (total, en cours, resolved)
- **Create Panne Form**: Basic form for declaring new breakdowns
- **Superviseur Dashboard**: 4-card metrics (total, en cours, resolved, MTTR)
- **API Integrations**: Auth, pannes, materiels basic calls
- **Routing Structure**: Auth, pointeur, superviseur pages

### ❌ MISSING/INCOMPLETE

---

## 🛑 CRITICAL GAPS (MVP Requirements)

### 1. **NOTIFICATIONS SYSTEM** 
**Priority:** HIGH  
**PRD Reference:** Section 5.3, Section 8 Endpoints

**What's Missing:**
- [ ] Notification API integration (`GET /api/notifications`, `PUT /api/notifications/{id}/read`)
- [ ] Notification bell icon with unread count badge
- [ ] Notification dropdown/modal view
- [ ] Mark notification as read functionality
- [ ] Mark all notifications as read functionality
- [ ] Real-time badge update on Superviseur dashboard

**Frontend Files Needed:**
- `src/api/notifications.api.js` - API calls
- `src/components/shared/NotificationBell.jsx` - Header bell component
- `src/components/shared/NotificationDropdown.jsx` - Notifications list
- Update `src/pages/superviseur/DashboardPage.jsx` - Add bell to header

**Impact:** Without this, supervisors can't track new breakdowns in real-time.

---

### 2. **PANNE DETAIL & ACTIONS MANAGEMENT**
**Priority:** HIGH  
**PRD Reference:** Section 5.1.3, Section 5.1.4

**What's Missing:**
- [ ] Panne detail page (`/pointeur/pannes/{id}` or `/superviseur/pannes/{id}`)
- [ ] Display panne full information (zone, type, equipment, plan d'action, timeline)
- [ ] Actions (interventions) list for the panne
- [ ] Add corrective action modal/form
- [ ] Edit action functionality
- [ ] Delete action functionality
- [ ] Timeline view of actions
- [ ] **Resolve Panne workflow** (close panne, set date_fin)

**Frontend Files Needed:**
- `src/pages/pointeur/PanneDetailPage.jsx` - Full detail view with actions management
- `src/pages/superviseur/PanneDetailPage.jsx` - Read-only detail view for supervisors
- `src/components/forms/ActionForm.jsx` - Add/edit action corrective
- `src/api/actions.api.js` - Action CRUD calls
- Update `src/api/pannes.api.js` - Add resolve, get actions

**Current API Endpoints:**
- `POST /api/pannes/{panne}/actions` - Add action
- `PUT /api/actions/{id}` - Update action
- `DELETE /api/actions/{id}` - Delete action
- `GET /api/pannes/{panne}/actions` - List actions
- `PUT /api/pannes/{id}/resolve` - Close panne

**Impact:** Pointeurs can't manage corrective actions or close pannes. Supervisors can't see action history.

---

### 3. **ADVANCED DASHBOARD FEATURES**

#### 3.1 Superviseur Dashboard Enhancements
**Priority:** HIGH  
**PRD Reference:** Section 5.2

**Missing Elements:**
- [ ] **MTBF per equipment** (Mean Time Between Failures)
- [ ] **MTTR per equipment** (not just global)
- [ ] **Pannes by category** breakdown
- [ ] **Active Pannes List** - table showing current breakdowns
- [ ] **Equipment Filter** - select equipment to view its KPIs
- [ ] **Zone Filter** - filter by geographical zone
- [ ] **Panne History Table** - all pannes with details, sorting, pagination
- [ ] Click panne to view details

**Backend Provides:**
- `GET /api/dashboard/stats` - Returns: total_pannes, pannes_en_cours, pannes_resolues, mttr_hours
- `GET /api/dashboard/stats?materiel_id=X` - Filtered by equipment
- `GET /api/dashboard/stats?zone=X` - Filtered by zone
- `GET /api/pannes` - List all pannes

**What UI should show:**
```
┌─────────────────────────────────────────────┐
│ SMART MENARA - Superviseur Dashboard        │
├─────────────────────────────────────────────┤
│ [Filters: Equipment ▼] [Zone ▼]  [Notifications Bell] │
├─────────────────────────────────────────────┤
│ KPI Cards (4):                              │
│ • Total Pannes    • En Cours  • Résolues   │ 
│ • MTBF (by equip) • MTTR (by equip)        │
├─────────────────────────────────────────────┤
│ Active Pannes (Table):                      │
│ Zone | Type | Equipment | Duration | Status│
├─────────────────────────────────────────────┤
│ Historical Data (Chart/Table)               │
└─────────────────────────────────────────────┘
```

**Frontend Files Needed:**
- Update `src/pages/superviseur/DashboardPage.jsx` - Complete redesign
- `src/components/shared/FilterBar.jsx` - Equipment/Zone filters
- `src/components/shared/PannesTable.jsx` - Active pannes list
- `src/components/shared/KPICard.jsx` - Reusable KPI metric card

**Impact:** Supervisors have incomplete visibility into maintenance metrics.

---

#### 3.2 Pointeur Dashboard Enhancements
**Priority:** MEDIUM  
**Current State:** Lists own pannes but missing interactions

**Missing Elements:**
- [ ] **Quick Resolve Button** - directly close panne from list with date picker
- [ ] **View Details Link** - navigate to detail page
- [ ] **Add Action Inline** - quick action addition
- [ ] **Duration Elapsed** - show how long panne is open
- [ ] **Sortable Columns** - by date, status, zone
- [ ] **Search Box** - filter by zone or type

---

### 4. **EQUIPMENT MANAGEMENT UI**
**Priority:** MEDIUM  
**PRD Reference:** Section 5.4

**What's Missing:**
- [ ] Equipment list page (superviseur only)
- [ ] Add equipment modal (superviseur only)
- [ ] Edit equipment form
- [ ] Delete equipment with confirmation
- [ ] Equipment search/filter

**Backend Provides:**
- `GET /api/materiels` - Already working
- `POST /api/materiels` - Already working (pointeur can add during panne creation)
- `PUT /api/materiels/{id}` - Superviseur route
- `DELETE /api/materiels/{id}` - Superviseur route

**Current Issue:** Pointeur can add equipment during panne creation, but superviseurs have no management UI.

**Files Needed:**
- `src/pages/superviseur/EquipmentPage.jsx` - Equipment list and management
- `src/components/forms/EquipmentForm.jsx` - Add/edit equipment

---

### 5. **USER PROFILE / ACCOUNT PAGE**
**Priority:** LOW  
**PRD Reference:** Section 8 - `PUT /api/profile`

**Missing:**
- [ ] Profile page (`/profile`)
- [ ] Edit profile form (nom, email, phone, password)
- [ ] Update profile endpoint integration
- [ ] Link in header navigation

**Files Needed:**
- `src/pages/ProfilePage.jsx`
- Update `src/api/auth.api.js` - Add updateProfile()

---

### 6. **MATERIELS DROPDOWN IN CREATE PANNE FORM**
**Priority:** CRITICAL  
**Current State:** Partially working

**Issues:**
- [ ] Can't add new equipment if not in list (PRD says pointeurs can add)
- [ ] Need modal/inline form to add equipment while creating panne
- [ ] Equipment filtering by carrière

**Files Needed:**
- `src/components/forms/QuickMaterielForm.jsx` - Quick add equipment

---

### 7. **ERROR HANDLING & VALIDATION**
**Priority:** MEDIUM

**Missing:**
- [ ] Form validation messages beyond basic required fields
- [ ] HTTP error handling consistency
- [ ] 403/401 error pages (unauthorized/not authenticated)
- [ ] 404 error page (panne not found)
- [ ] Network error messages
- [ ] Field-level error display on forms

**Files Needed:**
- `src/pages/ErrorPages.jsx` - 404, 403, 500 error pages
- Enhance form validation in:
  - `CreatePannePage.jsx`
  - `PanneDetailPage.jsx`

---

### 8. **LAYOUT & NAVIGATION**
**Priority:** MEDIUM

**Missing:**
- [ ] Consistent navigation/header across all pages
- [ ] Sidebar navigation (optional but recommended)
- [ ] Breadcrumbs for navigation context
- [ ] Footer
- [ ] Mobile responsiveness (seems partially done but untested)

**Files Needed:**
- `src/components/layout/Header.jsx` - Shared header with notifications
- `src/components/layout/Sidebar.jsx` - Optional navigation
- `src/components/layout/Footer.jsx`

---

### 9. **DATA FORMATTING & PRESENTATION**
**Priority:** LOW

**Missing:**
- [ ] Date/time formatting consistency (already using date-fns, good)
- [ ] Duration calculation and display (e.g., "2h 30m" for MTTR)
- [ ] Status badge colors consistency
- [ ] Equipment category display consistency

---

### 10. **EMPTY COMPONENTS FOLDERS**
**Status:** Unused but reserved  
**Current State:** `src/components/forms/` and `src/components/ui/` are empty

**Should contain:**
- Form components (fields, buttons, etc.)
- UI components (modals, cards, badges, etc.)

---

## 🔧 API INTEGRATION STATUS

### ✅ Implemented
- `POST /api/login` ✅
- `POST /api/logout` ✅
- `GET /api/user` ✅
- `GET /api/materiels` ✅
- `POST /api/materiels` ✅
- `GET /api/pannes` ✅ (partial - no filter support)
- `POST /api/pannes` ✅
- `GET /api/dashboard/stats` ✅

### ❌ Missing Frontend Calls
- `GET /api/notifications` ❌
- `PUT /api/notifications/{id}/read` ❌
- `PUT /api/notifications/read-all` ❌
- `GET /api/pannes/{id}` ❌
- `PUT /api/pannes/{id}/resolve` ❌
- `GET /api/pannes/{panne}/actions` ❌
- `POST /api/pannes/{panne}/actions` ❌
- `PUT /api/actions/{id}` ❌
- `DELETE /api/actions/{id}` ❌
- `PUT /api/profile` ❌
- `GET /api/materiels/{id}/statistics` ❌ (available but unused)
- `PUT /api/materiels/{id}` ❌
- `DELETE /api/materiels/{id}` ❌

---

## 📋 PRIORITY IMPLEMENTATION ROADMAP

### Phase 1: CRITICAL (Day 1-2 Completion)
1. **Notifications System** - Required for PRD MVP
2. **Panne Detail & Actions** - Required for PR workflow
3. **Superviseur Dashboard Filters** - Required for PRD requirements

### Phase 2: HIGH (Day 2-3)
4. **Resolve Panne Workflow** - Core pointeur functionality
5. **Better Error Handling** - Better UX
6. **Equipment Management UI** - Superviseur control

### Phase 3: MEDIUM (Day 3+)
7. **Profile Page** - User management
8. **Materiels Dropdown Enhancement** - Better UX in create panne
9. **Layout/Navigation** - Polish
10. **Data Formatting** - Polish

---

## 📁 FRONTEND FOLDER STRUCTURE TO UPDATE

```
frontend/src/
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx ✅
│   ├── pointeur/
│   │   ├── DashboardPage.jsx ✅
│   │   ├── CreatePannePage.jsx ✅
│   │   └── PanneDetailPage.jsx ❌ NEW
│   ├── superviseur/
│   │   ├── DashboardPage.jsx ✅ (needs enhancement)
│   │   ├── PanneDetailPage.jsx ❌ NEW
│   │   └── EquipmentPage.jsx ❌ NEW
│   ├── ProfilePage.jsx ❌ NEW
│   └── ErrorPages.jsx ❌ NEW
│
├── components/
│   ├── forms/
│   │   ├── ActionForm.jsx ❌ NEW
│   │   ├── EquipmentForm.jsx ❌ NEW
│   │   └── QuickMaterielForm.jsx ❌ NEW
│   ├── layout/
│   │   ├── Header.jsx ❌ NEW
│   │   └── Sidebar.jsx ❌ NEW (optional)
│   ├── shared/
│   │   ├── NotificationBell.jsx ❌ NEW
│   │   ├── NotificationDropdown.jsx ❌ NEW
│   │   ├── FilterBar.jsx ❌ NEW
│   │   ├── PannesTable.jsx ❌ NEW
│   │   └── KPICard.jsx ❌ NEW
│   └── ui/
│       ├── Modal.jsx ❌ NEW
│       ├── Badge.jsx ❌ NEW
│       └── Button.jsx ❌ NEW
│
└── api/
    ├── auth.api.js ✅
    ├── pannes.api.js ✅ (needs enhancement)
    ├── materiels.api.js ✅
    ├── notifications.api.js ❌ NEW
    └── actions.api.js ❌ NEW
```

---

## 🎯 QUICK START: TOP 3 GAPS TO CLOSE

### **Gap #1: Notifications (Start Here)**
- Create `src/api/notifications.api.js`
- Create `src/components/shared/NotificationBell.jsx`
- Add bell to superviseur dashboard header
- Fetch unread count on dashboard load

### **Gap #2: Panne Details & Actions**
- Create `src/pages/pointeur/PanneDetailPage.jsx`
- Create `src/components/forms/ActionForm.jsx`
- Create `src/api/actions.api.js`
- Add "Voir détails" link from dashboard

### **Gap #3: Superviseur Dashboard Filters**
- Update `src/pages/superviseur/DashboardPage.jsx`
- Create `src/components/shared/FilterBar.jsx`
- Create `src/components/shared/PannesTable.jsx`
- Add materiel_id and zone filters to stats endpoint call

---

## 📝 NOTES

- **Backend is ready**: All endpoints exist and are functional in the backend routes
- **Styling**: Tailwind CSS already configured, reuse existing patterns
- **Date handling**: `date-fns` already imported and used, continue using it
- **Error states**: Currently minimal error handling, should add more validation
- **Loading states**: Some pages have loading spinners, should be consistent
- **Accessibility**: No a11y concerns currently, but should consider ARIA labels on interactive elements

