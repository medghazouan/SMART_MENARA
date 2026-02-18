Backend Gaps -- Build Checklist

Phase 1: Schema Fixes and Missing Migration

This phase corrects existing schema issues and adds the missing notifications table before any code depends on it.

1.1 Fix pannes migration ([backend/database/migrations/2026_02_18_141021_create_pannes_table.php](backend/database/migrations/2026_02_18_141021_create_pannes_table.php))





Change $table->date('date_panne') to $table->dateTime('date_panne')



Change $table->date('date_fin') to $table->dateTime('date_fin')->nullable()



Change status enum from ('En cours', 'Resolue', 'En attente') to ('en_cours', 'resolue') with default 'en_cours'



Add index: $table->index('materiel_id')



Add index: $table->index('status')



Add index: $table->index('date_panne')

1.2 Create notifications migration (new file)

Create database/migrations/xxxx_create_notifications_table.php with:





$table->id() -- auto-increment PK



$table->unsignedBigInteger('superviseur_id') -- FK to superviseurs.matricule



$table->unsignedBigInteger('panne_id') -- FK to pannes.id



$table->string('message', 500)



$table->boolean('is_read')->default(false)



$table->timestamps()



Foreign key constraints for both superviseur_id and panne_id



Index on (superviseur_id, is_read) for efficient unread queries

1.3 Update Panne model casts ([backend/app/Models/Panne.php](backend/app/Models/Panne.php))





Change 'date_panne' => 'date' to 'date_panne' => 'datetime'



Change 'date_fin' => 'date' to 'date_fin' => 'datetime'

1.4 Update PanneController validation ([backend/app/Http/Controllers/Api/PanneController.php](backend/app/Http/Controllers/Api/PanneController.php))





In store(): change status validation from 'in:En cours,Resolue,En attente' to 'in:en_cours,resolue'



In update(): same enum fix



Remove status from store() required validation (PRD says it's automatic, always en_cours on creation)



Phase 2: Notification Model and PanneObserver

2.1 Create Notification model (new file: app/Models/Notification.php)





Define $fillable: superviseur_id, panne_id, message, is_read



Cast is_read to boolean



belongsTo(Superviseur::class, 'superviseur_id', 'matricule')



belongsTo(Panne::class, 'panne_id')

2.2 Add reverse relationships





In Superviseur model: add hasMany(Notification::class, 'superviseur_id', 'matricule')



In Panne model: add hasMany(Notification::class, 'panne_id')

2.3 Create PanneObserver (new file: app/Observers/PanneObserver.php)





Implement created(Panne $panne) method



Inside: load $panne->carriere->superviseur to get the target superviseur



Insert a Notification row with:





superviseur_id = carriere's superviseur matricule



panne_id = the new panne's id



message = formatted string, e.g. "Nouvelle panne: {$panne->type} sur {$panne->materiel->nom}"



is_read = false

2.4 Register the observer





In app/Providers/AppServiceProvider.php boot() method, add: Panne::observe(PanneObserver::class)



Phase 3: Controllers and Endpoints

3.1 Create NotificationController (new file: app/Http/Controllers/Api/NotificationController.php)





index(Request $request) -- return unread notifications for the authenticated superviseur, ordered by created_at desc, eager-load panne.materiel



markAsRead($id) -- find notification by id, verify it belongs to the auth user, set is_read = true



markAllAsRead(Request $request) -- update all unread notifications for the auth superviseur to is_read = true

3.2 Create DashboardController (new file: app/Http/Controllers/Api/DashboardController.php)





stats(Request $request) endpoint at GET /api/dashboard/stats



Accept optional query params: materiel_id, zone



Compute and return:





pannes_en_cours -- count of pannes with status en_cours (filtered)



pannes_resolues -- count of pannes with status resolue (filtered)



total_pannes -- total count (filtered)



mttr_hours -- AVG(TIMESTAMPDIFF(HOUR, date_panne, date_fin)) for resolved pannes



mtbf_hours -- Total operating hours / Number of failures per PRD formula, by equipment or globally



Support filtering by materiel_id and zone via ->when() clauses

3.3 Add resolve method to PanneController ([backend/app/Http/Controllers/Api/PanneController.php](backend/app/Http/Controllers/Api/PanneController.php))





New method: resolve(Request $request, $id)



Validate that date_fin is provided and is a datetime after date_panne



Verify the authenticated pointeur is the one who declared this panne ($panne->pointeur_id === auth user matricule)



Update panne: status = 'resolue', date_fin = validated value



Return updated panne with relationships

3.4 Add nested action methods to PanneController or ActionController





panneActions($panneId) -- GET /api/pannes/{panne}/actions returns actions for that panne



storePanneAction(Request $request, $panneId) -- POST /api/pannes/{panne}/actions creates an action linked to the panne



Validate panne exists, validate intervention + date fields

3.5 Implement PointeurController ([backend/app/Http/Controllers/Api/PointeurController.php](backend/app/Http/Controllers/Api/PointeurController.php))





index() -- list all pointeurs (with carriere relationship)



show($id) -- single pointeur with carriere + pannes



store() / update() / destroy() -- full CRUD with validation

3.6 Implement SuperviseurController ([backend/app/Http/Controllers/Api/SuperviseurController.php](backend/app/Http/Controllers/Api/SuperviseurController.php))





index() -- list all superviseurs (with carrieres relationship)



show($id) -- single superviseur with carrieres



store() / update() / destroy() -- full CRUD with validation



Phase 4: Middleware and Route Restructuring

4.1 Create role middleware (new files in app/Http/Middleware/)





EnsurePointeur.php -- check that auth()->user() is an instance of Pointeur, return 403 otherwise



EnsureSuperviseur.php -- check that auth()->user() is an instance of Superviseur, return 403 otherwise

4.2 Register middleware aliases





In bootstrap/app.php (Laravel 12), register 'pointeur' and 'superviseur' middleware aliases

4.3 Restructure routes ([backend/routes/api.php](backend/routes/api.php))

Replace the current flat structure with role-scoped groups:





Public routes (no auth):





POST /api/login -- unified login (auto-detect user type by checking both tables)



Authenticated (any role):





POST /api/logout



GET /api/user



GET /api/materiels



GET /api/pannes/{id}



GET /api/pannes/{panne}/actions



Pointeur-only (middleware: auth:sanctum + pointeur):





POST /api/pannes



PUT /api/pannes/{id}/resolve



POST /api/pannes/{panne}/actions



POST /api/materiels



Superviseur-only (middleware: auth:sanctum + superviseur):





GET /api/pannes (full list)



GET /api/dashboard/stats



GET /api/notifications



PUT /api/notifications/{id}/read



PUT /api/notifications/read-all

4.4 Unify login endpoint in AuthController ([backend/app/Http/Controllers/Api/AuthController.php](backend/app/Http/Controllers/Api/AuthController.php))





Merge loginSuperviseur + loginPointeur into a single login(Request $request) method



Logic: try to find user in superviseurs table first, then pointeurs table



Return type: 'superviseur' or type: 'pointeur' in the response so the frontend knows which role



Phase 5: Form Requests and Final Polish

5.1 Create Form Request classes (new files in app/Http/Requests/)





StorePanneRequest.php -- validates zone, type, date_panne, plan_action, pointeur_id, carriere_id, materiel_id



ResolvePanneRequest.php -- validates date_fin (required, datetime, after date_panne)



StoreMaterielRequest.php -- validates matricule (unique), nom, categorie, carriere_id



StoreActionRequest.php -- validates date, intervention



LoginRequest.php -- validates email, password

5.2 Wire Form Requests into controllers





Replace inline $request->validate() calls with the corresponding Form Request type-hints in each controller method

5.3 Update seeder with more realistic data





Add more materiels matching PRD examples (Broyeur BK-500, Concasseur, etc.)



Add a second superviseur for testing



Add sample pannes and actions for dashboard testing



Add sample notifications

5.4 Remove the auto-resolve logic in ActionController





Remove the str_contains(..., 'resolu') auto-status-change hack in [ActionController@store](backend/app/Http/Controllers/Api/ActionController.php) -- panne resolution should only happen through the dedicated /resolve endpoint

5.5 Clean up unused default Laravel scaffolding





Remove the default User model and create_users_table migration if not needed (auth uses Superviseur/Pointeur models)



Or keep them if you plan to use a unified polymorphic auth later



Files to Create (Summary)







File



Purpose





database/migrations/xxxx_create_notifications_table.php



notifications table





app/Models/Notification.php



Notification Eloquent model





app/Observers/PanneObserver.php



Auto-create notification on panne creation





app/Http/Controllers/Api/NotificationController.php



Notification CRUD endpoints





app/Http/Controllers/Api/DashboardController.php



KPI stats endpoint





app/Http/Middleware/EnsurePointeur.php



Pointeur role guard





app/Http/Middleware/EnsureSuperviseur.php



Superviseur role guard





app/Http/Requests/StorePanneRequest.php



Panne creation validation





app/Http/Requests/ResolvePanneRequest.php



Panne resolution validation





app/Http/Requests/StoreMaterielRequest.php



Materiel creation validation





app/Http/Requests/StoreActionRequest.php



Action creation validation





app/Http/Requests/LoginRequest.php



Login validation

Files to Modify (Summary)







File



Changes





database/migrations/...create_pannes_table.php



dateTime, enum fix, indexes





app/Models/Panne.php



datetime casts, notification relationship





app/Models/Superviseur.php



notifications relationship





app/Http/Controllers/Api/PanneController.php



resolve method, enum fix, Form Request





app/Http/Controllers/Api/ActionController.php



remove auto-resolve hack, nested routes





app/Http/Controllers/Api/AuthController.php



unified login





app/Http/Controllers/Api/PointeurController.php



full implementation





app/Http/Controllers/Api/SuperviseurController.php



full implementation





routes/api.php



full restructure with role middleware





app/Providers/AppServiceProvider.php



register PanneObserver





database/seeders/DatabaseSeeder.php



richer test data

