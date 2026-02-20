# CLAUDE.md — MenaraReporting

> AI assistant context file. Keep this up to date when making architectural changes.

---

## Project Overview

**MenaraReporting** is a quarry (carrière) fault-reporting and intervention-tracking platform for Menara.

Two user roles:
- **Superviseur** — manages quarries, equipment, and pointeurs; views dashboards and notifications
- **Pointeur** — reports breakdowns (pannes), adds interventions (actions), and resolves pannes

---

## Architecture

```
MenaraReporting/
├── backend/          # Laravel 12 REST API (PHP 8.2)
└── frontend/         # React 19 SPA (Vite 7 + Tailwind 4)
```

---

## Backend

### Stack
- **Framework**: Laravel 12
- **Auth**: Laravel Sanctum (token-based, `auth:sanctum` middleware)
- **DB**: MySQL
- **PHP**: 8.2+

### Start the server
```bash
cd backend
php artisan serve          # http://localhost:8000
```

### Database
```bash
php artisan migrate             # run all pending migrations
php artisan migrate:fresh --seed  # reset + seed test data
php artisan db:seed             # seed only
```

### Key commands
```bash
php artisan make:migration <name> --table=<table>
php artisan make:model <Name> -m
php artisan make:controller Api/<Name>Controller
php artisan make:request <Name>Request
php artisan route:list --path=api   # list all API routes
php artisan tinker
```

### Auth flow
- `POST /api/register` — superviseur self-registration (public)
- `POST /api/login` — unified login for both roles; returns `{ token, role, user }`
- Role detected by checking if the email/matricule exists in `superviseurs` or `pointeurs` table
- Token is a Sanctum personal access token stored in the `personal_access_tokens` table

### Middleware
| Alias | File | Purpose |
|---|---|---|
| `auth:sanctum` | built-in | authenticated user |
| `pointeur` | `EnsurePointeur.php` | blocks non-pointeurs |
| `superviseur` | `EnsureSuperviseur.php` | blocks non-superviseurs |

### Role identification in controllers
```php
$user = $request->user();         // returns Pointeur or Superviseur model
$user->getTable();                 // 'pointeurs' or 'superviseurs'
// OR check session token's tokenable_type
```

### Models & relationships
```
Superviseur  --hasMany--> Carriere
Superviseur  --hasMany--> Pointeur   (via carrieres)
Superviseur  --hasMany--> Notification
Carriere     --hasMany--> Materiel
Carriere     --hasMany--> Pointeur
Pointeur     --hasMany--> Panne
Materiel     --hasMany--> Panne
Panne        --hasMany--> Action
Panne        --hasMany--> Notification
```

### Database schema (key tables)

**pannes**
| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `materiel_id` | FK → materiels | |
| `pointeur_id` | FK → pointeurs | who reported it |
| `zone` | string | |
| `type` | string | |
| `description` | text nullable | |
| `plan_action` | text nullable | |
| `date_panne` | dateTime | cast to `datetime` |
| `date_fin` | dateTime nullable | cast to `datetime` |
| `status` | enum(`en_cours`, `resolue`) | default `en_cours` |

**actions**
| Column | Type | Notes |
|---|---|---|
| `id` | bigint PK | |
| `panne_id` | FK → pannes | |
| `date` | date | cast to `date` |
| `type` | string | `Corrective`, `Preventive`, `Maintenance` |
| `intervention` | text | description of work done |
| `temps_estime` | float nullable | hours |

### Important conventions
- **Always use `$request->filled()`** not `$request->has()` for optional filter params — `has()` returns true even for empty strings
- **Always cast IDs** when comparing: `(int) $panne->pointeur_id !== (int) $user->matricule` — MySQL returns strings, PHP models return ints
- **Scoping**: superviseur queries must always be scoped to their own carrieres — never return data from other superviseurs
- **Validation**: use Form Requests (`StoreActionRequest`, `StorePanneRequest`, etc.) — never validate in controllers
- **`panne_id` in nested routes**: When calling `POST /pannes/{panne}/actions`, `panne_id` comes from the route, not the body — `StoreActionRequest` uses `sometimes` rule in that case

---

## Frontend

### Stack
- **Framework**: React 19
- **Build**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **HTTP**: Axios (with interceptors in `axios.config.js`)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toasts**: Sonner
- **State**: Zustand (for global state), React Context (for auth)
- **Date formatting**: date-fns

### Start the dev server
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

### Environment
```
# frontend/.env.local
VITE_API_URL=http://localhost:8000/api
```

### Project structure
```
src/
├── api/
│   ├── axios.config.js       # base Axios instance with auth token interceptor
│   ├── auth.api.js
│   ├── pannes.api.js
│   ├── actions.api.js        # maps frontend field names → backend field names
│   ├── materiels.api.js
│   └── notifications.api.js
├── context/
│   └── AuthContext.jsx       # login/logout, persisted token, role detection
├── routes/
│   └── ProtectedRoute.jsx    # redirects by role
├── pages/
│   ├── auth/LoginPage.jsx
│   ├── superviseur/
│   │   ├── DashboardPage.jsx
│   │   └── PanneDetailPage.jsx
│   └── pointeur/
│       ├── DashboardPage.jsx
│       ├── CreatePannePage.jsx
│       └── PanneDetailPage.jsx
└── components/
    ├── forms/ActionForm.jsx
    └── shared/
        ├── FilterBar.jsx
        ├── KPICard.jsx
        ├── NotificationBell.jsx
        └── PannesTable.jsx
```

### Critical field mapping (actions)
The `ActionForm` uses frontend-friendly names. `actionsAPI.create()` translates them:
| Frontend form field | Backend API field |
|---|---|
| `description` | `intervention` |
| `date_action` | `date` |
| `type` | `type` (same) |
| `temps_estime` | `temps_estime` (same) |

**Never read `action.date_action` in the UI** — the API response returns `action.date` and `action.intervention`.

### Date formatting — always guard against null
```jsx
// CORRECT — guards against null/undefined before calling date-fns
{action.date ? format(new Date(action.date), 'dd/MM/yyyy') : '—'}

// WRONG — crashes with RangeError if action.date is null/undefined
{format(new Date(action.date_action), 'dd/MM/yyyy')}
```

### Auth context usage
```jsx
const { user, token, role, login, logout } = useAuth();
// role === 'superviseur' | 'pointeur'
```

---

## API Reference (quick)

### Public
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Superviseur self-registration |
| POST | `/login` | Unified login (returns token + role) |

### Authenticated (any role)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/logout` | Revoke token |
| GET | `/user` | Current user info |
| PUT | `/profile` | Update own profile |
| GET | `/materiels` | List equipment |
| GET | `/materiels/{id}` | Equipment detail |
| GET | `/materiels/{id}/statistics` | Equipment panne stats |
| GET | `/carrieres` | List quarries |
| GET | `/pannes/{id}` | Panne detail |
| GET | `/pannes/{panne}/actions` | Actions for a panne |
| GET | `/actions` | List actions (filter: `panne_id`, `date_from`, `date_to`) |

### Pointeur-only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/my-pannes` | Pointeur's own pannes |
| POST | `/pannes` | Report a new panne |
| PUT | `/pannes/{id}/resolve` | Resolve a panne (only own pannes) |
| POST | `/pannes/{panne}/actions` | Add action to a panne |
| POST | `/actions` | Create standalone action |
| PUT | `/actions/{id}` | Update action |
| DELETE | `/actions/{id}` | Delete action |

### Superviseur-only
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/stats` | KPIs (filter: `carriere_id`, `date_from`, `date_to`) |
| GET | `/pannes` | All pannes in superviseur's carrieres (filter: `status`, `carriere_id`, `materiel_id`) |
| GET | `/notifications` | List notifications |
| GET | `/notifications/count` | Unread count |
| PUT | `/notifications/{id}/read` | Mark one read |
| PUT | `/notifications/read-all` | Mark all read |
| POST/PUT/DELETE | `/carrieres` | Manage quarries |
| PUT/DELETE | `/materiels/{id}` | Manage equipment |
| CRUD | `/pointeurs` | Manage pointeurs |
| CRUD | `/superviseurs` | Manage superviseurs |

---

## Known design decisions

1. **No `users` table for domain entities** — `superviseurs` and `pointeurs` are separate tables with their own PK (`matricule` for superviseurs, auto-id for pointeurs). Both use `HasApiTokens` from Sanctum.
2. **PanneObserver** auto-creates a `Notification` for the superviseur when a panne is created.
3. **Panne resolution** is pointeur-only. The superviseur's "Résoudre" button on their detail page was a UI mistake — it should only appear for pointeurs.
4. **`pointeur_id` in pannes** references `pointeurs.matricule`, not `pointeurs.id` — cast to `int` when comparing.
5. **Actions `type` column** was added in migration `2026_02_19` — if testing against a fresh DB, `migrate:fresh` is needed to include it.

---

## Running both servers (development)

Terminal 1:
```bash
cd backend && php artisan serve
```

Terminal 2:
```bash
cd frontend && npm run dev
```

---

## Seeded test credentials

After `php artisan migrate:fresh --seed`:

| Role | Email / Matricule | Password |
|---|---|---|
| Superviseur | `sara@menara.com` | `password` |
| Pointeur | (check seeder) | `password` |
