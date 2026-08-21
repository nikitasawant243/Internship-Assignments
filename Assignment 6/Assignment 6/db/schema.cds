namespace vendor.onboarding;

using { cuid, managed } from '@sap/cds/common';

// ─────────────────────────────────────────────
//  Reference / Master-data tables
// ─────────────────────────────────────────────

/**
 * ISO country reference table.
 * Seeded from db/data/master-Country.csv
 */
entity Country {
  key code : String(3);     // ISO-3166 alpha-2/3 code, e.g. IN, US
      name : String(100);
}

/**
 * Vendors that are blacklisted and require forced approval routing.
 * Seeded from db/data/master-BlacklistVendor.csv
 */
entity BlacklistVendor {
  key vendorCode : String(20);
      reason     : String(255);
}

// ─────────────────────────────────────────────
//  Staging — uploaded but not yet approved
// ─────────────────────────────────────────────

/**
 * Holds every uploaded vendor row before it is approved or rejected.
 * Invalid rows are stored here with their validation error JSON so the
 * uploader can see row-wise errors without losing context.
 */
entity VendorStaging {
  key ID               : UUID;
      rowNumber        : Integer;          // Row number from Excel (1-based)
      vendorCode       : String(20);
      vendorName       : String(100);
      panNumber        : String(10);
      gstNumber        : String(15);
      country          : Association to Country;
      bankAccount      : String(30);
      ifscCode         : String(11);
      creditLimit      : Decimal(18,2);
      status           : String(10) default 'PENDING';
        // PENDING | APPROVED | REJECTED | INVALID
      uploadSessionID  : UUID;             // Groups rows from the same upload batch
      uploadedBy       : String(100);
      uploadedAt       : Timestamp;
      validationErrors : LargeString;      // JSON array of { field, message }
      requiresApproval : Boolean default false;
      approvalReasons  : String(500);      // Comma-separated reasons for approval routing
}

// ─────────────────────────────────────────────
//  Master — approved and active vendor records
// ─────────────────────────────────────────────

/**
 * Final approved vendor master table.
 * Rows are copied here from VendorStaging on approval.
 */
entity VendorMaster {
  key ID           : UUID;
      vendorCode   : String(20);
      vendorName   : String(100);
      panNumber    : String(10);
      gstNumber    : String(15);
      country      : Association to Country;
      bankAccount  : String(30);
      ifscCode     : String(11);
      creditLimit  : Decimal(18,2);
      stagingID    : UUID;                 // Back-reference to VendorStaging
      approvedBy   : String(100);
      approvedAt   : Timestamp;
}

// ─────────────────────────────────────────────
//  Approval records — one per approve/reject action
// ─────────────────────────────────────────────

/**
 * Captures every approval or rejection decision with the actor,
 * timestamp, and optional comment.
 */
entity VendorApproval {
  key ID         : UUID;
      staging    : Association to VendorStaging;
      action     : String(10);    // APPROVE | REJECT
      comment    : String(500);
      actionBy   : String(100);
      actionAt   : Timestamp;
}

// ─────────────────────────────────────────────
//  Audit log — immutable change history
// ─────────────────────────────────────────────

/**
 * Append-only audit trail for all significant state changes.
 * oldValue and newValue are stored as JSON strings.
 */
entity AuditLog {
  key ID         : UUID;
      entityName : String(50);    // e.g. VendorStaging, VendorMaster
      entityID   : UUID;
      action     : String(30);    // UPLOAD | APPROVE | REJECT
      changedBy  : String(100);
      changedAt  : Timestamp;
      oldValue   : LargeString;   // JSON snapshot before change
      newValue   : LargeString;   // JSON snapshot after change
}
