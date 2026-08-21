# Vendor Onboarding CAPM

**IBM Internship Assignment — Assignment 6**

A complete SAP CAP (Node.js) + SAPUI5 application for bulk vendor onboarding via Excel upload, with server-side validation and an approval workflow.

---

## Features

- **Excel Upload** — Drag-and-drop `.xlsx` upload; client-side preview via SheetJS before submission
- **Validation** — Mandatory fields, GST format (15-char), PAN format (`ABCDE1234F`), Country lookup, Credit Limit range (0 – ₹10 Cr), duplicate detection (within file and against DB)
- **Business Rules** — Auto-routes to approval if: Credit Limit > ₹1 Crore, Foreign Vendor, or Blacklisted Vendor
- **Workflow** — Submit → Approve / Reject (with mandatory comment)
- **Audit Trail** — Every approve/reject action logged with old value, new value, actor, and timestamp
- **Role-Based Access** — `Uploader` role for upload/submit; `Approver` role for approve/reject

---

## Project Structure

```
Assignment 6/
├── app/vendor-ui/webapp/
│   ├── controller/         # Upload, Approval, Vendor controllers
│   ├── view/               # Upload, Approval, Vendor XML views
│   ├── fragment/           # ApproveDialog, RejectDialog fragments
│   ├── model/models.js
│   ├── utils/formatter.js
│   ├── manifest.json
│   ├── Component.js
│   └── index.html
├── db/
│   ├── schema.cds          # All CDS entities
│   └── data/               # Seed CSV files
├── srv/
│   ├── vendor-service.cds  # Service definition with role guards
│   ├── vendor-service.js   # Handler wiring
│   ├── handlers/           # upload, validation, approval, audit handlers
│   └── utils/              # gstValidator, panValidator, duplicateChecker, businessRules, excelParser
├── uploads/
│   └── sample-vendors.xlsx # Sample data for demo
├── package.json
├── mta.yaml
├── xs-security.json
└── .cdsrc.json
```

---

## Quick Start

### Prerequisites

- Node.js >= 18
- `@sap/cds-dk` installed globally (or use npx):
  ```bash
  npm install -g @sap/cds-dk
  ```

### Install & Run

```bash
# Clone / navigate to the project folder
cd "Assignment 6"

# Install dependencies
npm install

# Start the CAP server with live reload
cds watch
```

The server starts at **http://localhost:4004**

### Open the UI

```
http://localhost:4004/vendor-ui/webapp/index.html
```

---

## Mock Users (Local Development)

Authentication is handled by CAP's built-in dummy auth provider. Use these credentials in the login prompt:

| Username   | Password      | Role(s)             |
|------------|---------------|---------------------|
| `uploader` | `uploader123` | Uploader            |
| `approver` | `approver123` | Approver            |
| `admin`    | `admin123`    | Uploader + Approver |

---

## Test Scenario Walkthrough

1. **Login as `uploader`**
2. Navigate to **Vendor Upload** tab
3. Click **Choose File** and select `uploads/sample-vendors.xlsx`
4. The preview table shows all 5 rows from the file
5. Click **Upload & Validate** — row-wise errors appear for invalid rows (Row 3: bad GST, Row 4: duplicate PAN)
6. Click **Submit** — valid rows (1, 2, 5) are saved to staging with status `PENDING`
7. **Logout** and **login as `approver`**
8. Navigate to **Approval** tab — 3 pending vendors appear
9. Click **Approve** on Row 1 (domestic vendor) — vendor moves to Master
10. Click **Reject** on Row 2 (foreign vendor > ₹1 Cr) — enter comment "Requires additional documentation" — vendor is rejected
11. Navigate to **Vendor Master** — Row 1 appears as approved
12. Click the vendor row — Audit Trail panel expands showing the approval event

---

## API Endpoints

| Method | Endpoint                    | Role Required | Description                    |
|--------|-----------------------------|---------------|--------------------------------|
| POST   | `/vendor/uploadVendors`     | Uploader      | Upload and validate vendor rows |
| POST   | `/vendor/approveVendor`     | Approver      | Approve a staging vendor        |
| POST   | `/vendor/rejectVendor`      | Approver      | Reject a staging vendor         |
| GET    | `/vendor/StagingVendors`    | Any           | List all staging vendors        |
| GET    | `/vendor/Vendors`           | Any           | List approved vendor master     |
| GET    | `/vendor/AuditLogs`         | Any           | List audit log entries          |
| GET    | `/vendor/Countries`         | Any           | List reference country codes    |

---

## Validation Rules

| Field         | Rule                                                            |
|---------------|-----------------------------------------------------------------|
| Vendor Code   | Mandatory                                                       |
| Vendor Name   | Mandatory                                                       |
| PAN Number    | Mandatory, format: `ABCDE1234F` (5 alpha + 4 digit + 1 alpha)  |
| GST Number    | Mandatory, exactly 15 characters, valid GST format             |
| Country       | Mandatory, must exist in Country reference table               |
| Bank Account  | Mandatory                                                       |
| IFSC Code     | Mandatory                                                       |
| Credit Limit  | Mandatory, > 0 and < ₹10,00,00,000 (10 Crores)                |

---

## Approval Routing Rules

A vendor is automatically routed to the approval queue if **any** of the following apply:

- Credit Limit > ₹1,00,00,000 (1 Crore)
- Country is not `IN` (Foreign Vendor)
- Vendor Code exists in the Blacklist table

---

## License

UNLICENSED — IBM Internship Assignment Project
