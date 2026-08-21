# Vendor Onboarding CAPM — Implementation Plan

## Top-Level Overview

Build a complete SAP CAP (Node.js) + SAPUI5 project called **"Vendor Onboarding CAPM"** for an IBM internship assignment.

**Goal:** Allow an Uploader to bulk-upload vendors via Excel, perform client-side preview + server-side validation, route records needing approval through an Approver workflow, and persist approved vendors to a master table — all with a full audit trail.

**Runtime:** Local SQLite / in-memory only (no BTP / HANA Cloud deployment).  
**Frontend:** Standalone SAPUI5 `index.html` served directly by CAP — no Fiori Launchpad.  
**Excel flow:** Client-side parse (SheetJS) → row preview → POST JSON → server validates + persists to staging → Approve/Reject workflow → VendorMaster.  
**Auth:** Role-based (`Uploader`, `Approver`) enforced via `xs-security.json` + `@requires` in CDS.

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffold & Configuration Files

**Intent:** Create the skeleton of the CAP project — `package.json`, `.cdsrc.json`, `mta.yaml`, `xs-security.json`, and `README.md` — so every subsequent sub-task can build on a runnable foundation.

**Expected Outcomes:**
- `npm install` succeeds and `cds watch` starts without errors.
- SQLite in-memory database is configured.
- Two app roles (`Uploader`, `Approver`) are declared in `xs-security.json`.

**Todo List:**
1. Create `package.json` with dependencies: `@sap/cds`, `express`, `xlsx`, `sqlite3`, `@sap/cds-dk` (devDependency). Add `start`, `watch`, and `build` scripts.
2. Create `.cdsrc.json` to set `db.kind = "sqlite"`, `db.credentials.database = ":memory:"`, and `requires.auth = "dummy"` (for local mock auth).
3. Create `xs-security.json` declaring scopes `Vendor.Upload` and `Vendor.Approve` and role-templates `Uploader` and `Approver`.
4. Create `mta.yaml` as a minimal local-runnable descriptor (no BTP modules needed; just document it).
5. Create `README.md` with setup instructions (`npm install`, `cds watch`, how to open the UI).

**Relevant Context:**
- CAP local SQLite setup uses `"db": { "kind": "sqlite", "credentials": { "database": ":memory:" } }` in `.cdsrc.json`.
- Dummy auth with mock users is configured under `"auth": { "kind": "dummy" }` and mock users in `.cdsrc.json`.
- Add two mock users: `uploader` (role `Uploader`) and `approver` (role `Approver`).

**Status:** [ ] pending

---

### Sub-Task 2 — CDS Data Model (`db/schema.cds`)

**Intent:** Define all database entities — `Country`, `BlacklistVendor`, `VendorStaging`, `VendorMaster`, `VendorApproval`, and `AuditLog` — with correct types, keys, associations, and field-level constraints.

**Expected Outcomes:**
- `cds compile db/schema.cds` produces no errors.
- All entities have appropriate key fields, status enums, and associations.
- CSV seed files (`master-Country.csv`, `master-BlacklistVendor.csv`) are wired to their entities.

**Todo List:**
1. Define `entity Country` with fields: `code` (key), `name`.
2. Define `entity BlacklistVendor` with fields: `vendorCode` (key), `reason`.
3. Define `entity VendorStaging` with fields: `ID` (UUID key), `vendorCode`, `vendorName`, `panNumber`, `gstNumber`, `country` (association to Country), `bankAccount`, `ifscCode`, `creditLimit` (Decimal), `status` (enum: `PENDING`, `APPROVED`, `REJECTED`), `uploadedBy`, `uploadedAt`, `rowNumber`, `validationErrors` (LargeString for JSON array).
4. Define `entity VendorMaster` with same vendor fields (no staging metadata), `approvedBy`, `approvedAt`.
5. Define `entity VendorApproval` with fields: `ID` (UUID key), `stagingID` (association to VendorStaging), `action` (enum: `APPROVE`, `REJECT`), `comment`, `actionBy`, `actionAt`.
6. Define `entity AuditLog` with fields: `ID` (UUID key), `entityName`, `entityID`, `action`, `changedBy`, `changedAt`, `oldValue` (LargeString), `newValue` (LargeString).
7. Create `db/data/master-Country.csv` with ~10 sample countries (IN, US, GB, DE, etc.).
8. Create `db/data/master-BlacklistVendor.csv` with 2–3 sample blacklisted vendor codes.

**Relevant Context:**
- CAP auto-seeds CSV files in `db/data/` if the filename matches `<namespace>-<EntityName>.csv`.
- Since there is no namespace, the filename pattern is just `<EntityName>.csv` — or use a descriptive prefix matching the service; choose `master-Country.csv` as stated in the project structure.
- Use `cds.UUID` for ID fields; use `cds.Timestamp` for date-time fields.

**Status:** [ ] pending

---

### Sub-Task 3 — CDS Service Definition (`srv/vendor-service.cds`)

**Intent:** Expose CAP service endpoints for upload, staging review, approval actions, master data, and audit log — with `@requires` role annotations to enforce Uploader / Approver separation.

**Expected Outcomes:**
- Service compiles cleanly.
- `POST /vendor/uploadVendors` is restricted to `Uploader`.
- `POST /vendor/approveVendor` and `POST /vendor/rejectVendor` are restricted to `Approver`.
- `GET` projections on VendorStaging, VendorMaster, AuditLog, and Country are exposed.

**Todo List:**
1. Define `service VendorService @(path: '/vendor')`.
2. Expose read-only projections: `entity Vendors as projection on VendorMaster`, `entity StagingVendors as projection on VendorStaging`, `entity Countries as projection on Country`, `entity AuditLogs as projection on AuditLog`.
3. Declare unbound action `uploadVendors(payload: array of VendorInput) returns UploadResult` annotated `@requires: 'Uploader'`. Define a type `VendorInput` for the input shape.
4. Declare unbound action `approveVendor(stagingID: UUID, comment: String)` annotated `@requires: 'Approver'`.
5. Declare unbound action `rejectVendor(stagingID: UUID, comment: String(500))` annotated `@requires: 'Approver'`.
6. Declare unbound function `getValidationErrors(uploadSessionID: UUID) returns array of ErrorRow` for fetching row-wise errors.

**Relevant Context:**
- CAP `@requires` annotation accepts a string role name matching xs-security role-templates.
- Unbound actions in CDS: `action myAction(param: Type) returns ReturnType;` inside the service block.
- Type definitions for input/output shapes reduce repetition.

**Status:** [ ] pending

---

### Sub-Task 4 — Utility Functions (`srv/utils/`)

**Intent:** Build isolated, testable utility modules for Excel parsing (server-side), GST validation, PAN validation, duplicate checking, and business rules — so handlers stay lean.

**Expected Outcomes:**
- Each util exports a pure function or small class.
- `gstValidator.js` returns `true/false` for a 15-char alphanum GST pattern.
- `panValidator.js` returns `true/false` for `ABCDE1234F` pattern.
- `duplicateChecker.js` accepts an array of rows + DB query results and flags intra-Excel and DB-level duplicates.
- `businessRules.js` returns `{ requiresApproval: true/false, reasons: [] }` given a vendor row + blacklist lookup.
- `excelParser.js` is a lightweight server-side XLSX reader (used for any server-side re-parse if needed).

**Todo List:**
1. Create `srv/utils/gstValidator.js` — export `validateGST(gst)`: checks length === 15 and regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`.
2. Create `srv/utils/panValidator.js` — export `validatePAN(pan)`: checks regex `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`.
3. Create `srv/utils/duplicateChecker.js` — export `findDuplicates(rows, existingRecords)`: returns map of row index → duplicate field name (`gstNumber`, `panNumber`, `bankAccount`). Checks both intra-array and against `existingRecords` array from DB.
4. Create `srv/utils/businessRules.js` — export `requiresApproval(vendor, blacklistedCodes)`: returns `{ required: Boolean, reasons: String[] }`. Rules: creditLimit > 10000000 (₹1 Crore), country !== 'IN' (foreign vendor), vendor code in blacklistedCodes.
5. Create `srv/utils/excelParser.js` — export `parseExcel(buffer)`: uses `xlsx` npm package to parse a Buffer and return array of row objects with normalized column names.

**Relevant Context:**
- GST format: 2-digit state code + 5-char PAN + 4-digit + 1 char + 1 char + Z + 1 char.
- PAN format: 5 uppercase letters + 4 digits + 1 uppercase letter.
- ₹1 Crore = 10,000,000; ₹10 Crore = 100,000,000.
- `xlsx` package is already in `package.json` from Sub-Task 1.

**Status:** [ ] pending

---

### Sub-Task 5 — Service Handlers (`srv/handlers/`)

**Intent:** Implement the four handler modules that wire CAP action events to business logic — upload, validation, approval, and audit — keeping each file focused on one concern.

**Expected Outcomes:**
- `upload-handler.js`: handles `uploadVendors` action — calls validation, persists to VendorStaging, returns per-row results.
- `validation-handler.js`: orchestrates all validators and duplicate checks, returns structured error list.
- `approval-handler.js`: handles `approveVendor` / `rejectVendor` — updates staging status, writes to VendorMaster on approve, creates VendorApproval record.
- `audit-handler.js`: exports `logAudit(tx, params)` — writes one AuditLog row.

**Todo List:**
1. Create `srv/handlers/validation-handler.js`:
   - Accept array of vendor rows.
   - For each row: check mandatory fields, call `validateGST`, `validatePAN`, check creditLimit range.
   - Call `duplicateChecker` for cross-row and DB duplicates.
   - Return `{ valid: [], invalid: [{ rowNumber, vendorCode, errors: [] }] }`.
2. Create `srv/handlers/upload-handler.js`:
   - Register on `srv.on('uploadVendors', ...)`.
   - Parse incoming JSON payload, call `validation-handler`.
   - Persist each row to `VendorStaging` (status `PENDING` for valid rows, or store with `validationErrors` for invalid).
   - Return summary: `{ totalRows, validRows, invalidRows, errors[] }`.
3. Create `srv/handlers/approval-handler.js`:
   - Register on `approveVendor`: fetch staging record, call `audit-handler` with old/new values, copy to `VendorMaster`, set staging status = `APPROVED`, create `VendorApproval`.
   - Register on `rejectVendor`: require non-empty comment (throw error if blank), set staging status = `REJECTED`, create `VendorApproval`, call `audit-handler`.
4. Create `srv/handlers/audit-handler.js`:
   - Export `logAudit(tx, { entityName, entityID, action, changedBy, changedAt, oldValue, newValue })`.
   - Inserts one row into `AuditLog`.
5. Create `srv/vendor-service.js` — the CAP service implementation entry point; imports and calls all four handler register functions.

**Relevant Context:**
- CAP handler pattern: `module.exports = (srv) => { srv.on('actionName', handler) }`.
- `req.user.id` gives the logged-in user ID in CAP handlers.
- `req.data` holds action parameters.
- Use `cds.transaction(req)` or the CAP-provided `tx` for DB writes inside handlers.
- Reject must throw `req.error(400, 'Comment is required for rejection')` when comment is blank.

**Status:** [ ] pending

---

### Sub-Task 6 — SAPUI5 Frontend: Manifest, Component, Models

**Intent:** Set up the SAPUI5 app skeleton — `manifest.json`, `Component.js`, `model/models.js` — with routing configured for three views (Upload, Approval, Vendor).

**Expected Outcomes:**
- App bootstraps without console errors when served via `cds watch`.
- Three routes defined: `/upload`, `/approval`, `/vendor`.
- OData V4 model wired to `/vendor/` CAP service.
- Named JSON model `state` initialized for UI state management.

**Todo List:**
1. Create `app/vendor-ui/webapp/manifest.json`:
   - `sap.app` section: id `vendor.onboarding`, type `application`, title `Vendor Onboarding`.
   - `sap.ui5` section: routing with three routes (Upload → `Upload`, Approval → `Approval`, Vendor → `Vendor`).
   - Data sources: `mainService` pointing to `/vendor/` (OData V4).
   - Models: default model bound to `mainService`; named model `i18n` for future use.
2. Create `app/vendor-ui/webapp/Component.js` — standard `UIComponent` extending `sap/ui/core/UIComponent`, initializing models and router.
3. Create `app/vendor-ui/webapp/model/models.js` — export `createDeviceModel()` and `createStateModel()` helper functions.
4. Create `app/vendor-ui/webapp/index.html` — bootstrap SAPUI5 from CDN (`https://ui5.sap.com`), load `Component` via `ComponentSupport`.
5. Create `app/vendor-ui/webapp/utils/formatter.js` — export formatting helpers: `statusText(status)`, `statusState(status)` (returns `Success/Warning/Error`), `formatCurrency(amount)`.

**Relevant Context:**
- SAPUI5 version target: latest LTS (1.120+).
- Use `sap/ui/core/mvc/XMLView` pattern for views.
- The CAP server by default serves `app/` folder as static — place the UI under `app/vendor-ui/webapp/`.
- The `cds.serve` middleware will proxy `/vendor/` to the CAP OData endpoint.

**Status:** [ ] pending

---

### Sub-Task 7 — Upload View & Controller

**Intent:** Build the Excel Upload screen — a polished Fiori-style page with a drag-drop upload area, row-preview table, validation error table, and a Submit button.

**Expected Outcomes:**
- User can select an `.xlsx` file; SheetJS parses it client-side and shows a preview table.
- Validation errors are shown in a red error table with Row No, Vendor Code, and Error Message columns.
- Submit button POSTs parsed JSON to `POST /vendor/uploadVendors` action.
- Success/failure shown via `MessageToast` or `MessageBox`.

**Todo List:**
1. Create `app/vendor-ui/webapp/view/Upload.view.xml`:
   - Page header with title "Vendor Upload" and subtitle.
   - `sap.ui.unified.FileUploader` (hidden, triggered by a styled button) OR `sap.m.upload.UploadSet` for drag-drop feel.
   - Preview `sap.m.Table` bound to a local JSON model `uploadPreview`.
   - Error `sap.m.Table` (visible only when errors exist) with columns: Row No, Vendor Code, Error Message — styled with error semantic color.
   - Footer bar with "Upload & Validate" and "Submit" buttons.
2. Create `app/vendor-ui/webapp/controller/Upload.controller.js`:
   - `onFileChange`: read file via `FileReader`, call `XLSX.read()` (loaded from CDN), convert sheet to JSON, set `uploadPreview` model.
   - `onSubmit`: call `_submitToServer(rows)` which uses `fetch` or `sap.ui.model.odata.v4.ODataModel` to call the `uploadVendors` action.
   - `_handleUploadResult(result)`: populate error table model if errors exist; show success message if all valid.
   - `onNavigateToApproval`: route to Approval view.

**Relevant Context:**
- SheetJS (xlsx) loaded from CDN: `https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js` added to `index.html`.
- CAP unbound actions called via OData: `POST /vendor/uploadVendors` with body `{ payload: [...] }`.
- Use `sap.m.MessageStrip` at top of page for inline error/success feedback.

**Status:** [ ] pending

---

### Sub-Task 8 — Approval View & Controller + Dialogs

**Intent:** Build the Approval screen where an Approver sees all pending vendors, can approve or reject them, with a mandatory comment dialog for rejection.

**Expected Outcomes:**
- Table of pending vendors (status = PENDING) with Approve and Reject buttons per row.
- "Approve" calls `approveVendor` action directly.
- "Reject" opens `RejectDialog.fragment.xml` requiring a comment before submission.
- Status badges use semantic colors (Warning = Pending, Success = Approved, Error = Rejected).
- Approver-role annotation ensures non-approvers cannot call the actions (enforced server-side; UI shows friendly message if 403).

**Todo List:**
1. Create `app/vendor-ui/webapp/fragment/RejectDialog.fragment.xml` — `sap.m.Dialog` with a `sap.m.TextArea` for comment (required), Reject and Cancel buttons.
2. Create `app/vendor-ui/webapp/fragment/ApproveDialog.fragment.xml` — optional confirmation dialog before approving.
3. Create `app/vendor-ui/webapp/view/Approval.view.xml`:
   - `sap.m.Table` bound to `StagingVendors` OData entity with filter `status eq 'PENDING'`.
   - Columns: Row No, Vendor Code, Vendor Name, GST, PAN, Country, Bank Account, Credit Limit, Status, Actions.
   - Each row has Approve (`sap.m.Button` type=`Accept`) and Reject (`sap.m.Button` type=`Reject`) buttons.
   - `sap.m.ObjectStatus` for status column using `formatter.statusState`.
4. Create `app/vendor-ui/webapp/controller/Approval.controller.js`:
   - `onApprove(oEvent)`: get `stagingID` from binding context, call `approveVendor` OData action, refresh table.
   - `onRejectPress(oEvent)`: open `RejectDialog`, store selected `stagingID` in controller state.
   - `onRejectConfirm`: validate comment not empty, call `rejectVendor` action, close dialog, refresh table.
   - `onRejectCancel`: close dialog.

**Relevant Context:**
- Fragment loading pattern: `Fragment.load({ name: '...RejectDialog', controller: this })`.
- OData V4 action call pattern: `oModel.bindContext('/rejectVendor(...)')` then `.setParameter(...)` then `.execute()`.
- Binding context: `oEvent.getSource().getBindingContext().getProperty('ID')` to get stagingID.

**Status:** [ ] pending

---

### Sub-Task 9 — Vendor Master View & Controller

**Intent:** Build the read-only Vendor Master screen showing all approved vendors with search, sorting, and a detail panel showing audit history for a selected vendor.

**Expected Outcomes:**
- Table bound to `Vendors` (VendorMaster projection) with all key columns.
- Search bar filters by Vendor Code or Vendor Name.
- Selecting a row shows audit log entries for that vendor in a panel below.
- Export to Excel button (using SheetJS client-side).

**Todo List:**
1. Create `app/vendor-ui/webapp/view/Vendor.view.xml`:
   - `sap.m.SearchField` for live filter.
   - `sap.m.Table` bound to `Vendors` entity.
   - `sap.m.Panel` (initially collapsed) for audit trail table bound to `AuditLogs` filtered by selected vendor ID.
   - "Export" button in header.
2. Create `app/vendor-ui/webapp/controller/Vendor.controller.js`:
   - `onSearch`: apply client-side filter on the table binding.
   - `onRowSelect`: set audit log filter to selected vendor ID, expand audit panel.
   - `onExport`: iterate visible table rows, use XLSX to build a workbook, trigger download.

**Relevant Context:**
- OData V4 list binding filter: `oBinding.filter(new Filter('vendorCode', FilterOperator.Contains, query))`.
- Audit log is filtered by `entityID` matching the selected VendorMaster `ID`.

**Status:** [ ] pending

---

### Sub-Task 10 — Sample Excel File & Final Wiring

**Intent:** Create the sample `uploads/sample-vendors.xlsx` file and do final integration wiring — ensure the CAP app serves the UI correctly, all routes resolve, and a smoke-test pass is documented.

**Expected Outcomes:**
- `uploads/sample-vendors.xlsx` has correct column headers and ~5 sample rows (mix of valid, duplicate, invalid GST, foreign vendor).
- `cds watch` starts with no errors, UI loads at `http://localhost:4004`.
- Upload flow: select file → preview rows → submit → see validation errors for bad rows → pending rows appear in Approval view.
- Approval flow: Approver approves a vendor → appears in Vendor Master.

**Todo List:**
1. Create `uploads/sample-vendors.xlsx` with headers: `Vendor Code`, `Vendor Name`, `PAN Number`, `GST Number`, `Country`, `Bank Account`, `IFSC`, `Credit Limit`. Add 5 rows including: 1 fully valid domestic, 1 foreign vendor, 1 with invalid GST, 1 duplicate PAN (repeats row 1's PAN), 1 with credit limit > ₹1 Crore.
2. Verify `package.json` has `"cds": { "requires": { ... } }` or that `.cdsrc.json` covers all service wiring.
3. Confirm `app/vendor-ui/webapp/` is reachable under `http://localhost:4004/vendor-ui/webapp/index.html`.
4. Ensure SheetJS CDN script tag is in `index.html`.
5. Do a final review pass: check all `require()` paths are consistent, no broken imports, handler registration order in `vendor-service.js` is correct.
6. Update `README.md` with full run instructions and test scenario walkthrough.

**Relevant Context:**
- CAP serves static files from `app/` by default at the path matching the folder name.
- The URL will be `http://localhost:4004/vendor-ui/webapp/index.html`.
- Sample data rows should exercise all validation rules to make the demo compelling.

**Status:** [ ] pending

---

## Implementation Order

Sub-tasks must be completed in this sequence (each depends on the previous):

```
1 (Scaffold) → 2 (DB Schema) → 3 (CDS Service) → 4 (Utils) → 5 (Handlers)
                                                               ↓
                              10 (Final Wiring) ← 9 (Vendor View) ← 8 (Approval View) ← 7 (Upload View) ← 6 (UI Skeleton)
```

---

## Non-Goals

- No BTP / Cloud Foundry deployment.
- No Fiori Launchpad integration.
- No automated test suite (unit tests).
- No i18n translations (English only).
- No server-side Excel re-parse (server only receives JSON payload from client parser).
