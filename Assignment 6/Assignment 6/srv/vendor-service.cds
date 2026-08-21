using { vendor.onboarding as db } from '../db/schema';

// ─────────────────────────────────────────────────────────────────────────────
//  Input / Output type definitions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shape of one vendor row sent from the browser after client-side Excel parse.
 */
type VendorInput {
  rowNumber   : Integer;
  vendorCode  : String(20);
  vendorName  : String(100);
  panNumber   : String(10);
  gstNumber   : String(15);
  country     : String(3);
  bankAccount : String(30);
  ifscCode    : String(11);
  creditLimit : Decimal(18,2);
}

/**
 * One row-level validation error returned after upload.
 */
type ErrorRow {
  rowNumber   : Integer;
  vendorCode  : String(20);
  field       : String(50);
  message     : String(500);
}

/**
 * Summary result returned by uploadVendors.
 */
type UploadResult {
  uploadSessionID : UUID;
  totalRows       : Integer;
  validRows       : Integer;
  invalidRows     : Integer;
  errors          : array of ErrorRow;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Service
// ─────────────────────────────────────────────────────────────────────────────

@path: '/vendor'
service VendorService {

  // ── Read-only projections ──────────────────────────────────────────────────

  /** Approved vendor master records — readable by everyone. */
  @readonly
  entity Vendors         as projection on db.VendorMaster
    excluding { stagingID };

  /** Staging vendor records — Uploader and Approver can read. */
  @readonly
  entity StagingVendors  as projection on db.VendorStaging;

  /** Country reference — readable by everyone. */
  @readonly
  entity Countries       as projection on db.Country;

  /** Audit log — readable by everyone. */
  @readonly
  entity AuditLogs       as projection on db.AuditLog;

  /** Blacklisted vendors — readable by everyone (for UI display). */
  @readonly
  entity BlacklistVendors as projection on db.BlacklistVendor;

  // ── Upload action — Uploader role only ────────────────────────────────────

  /**
   * Accepts a JSON array of vendor rows parsed from Excel.
   * Validates each row, persists valid rows to VendorStaging with PENDING status,
   * and returns a row-wise error report for invalid rows.
   */
  @requires: 'Uploader'
  action uploadVendors(payload: array of VendorInput)
    returns UploadResult;

  // ── Approval actions — Approver role only ─────────────────────────────────

  /**
   * Approves a staging vendor: copies record to VendorMaster,
   * sets staging status to APPROVED, creates VendorApproval record,
   * and writes an AuditLog entry.
   */
  @requires: 'Approver'
  action approveVendor(stagingID: UUID, comment: String(500))
    returns String;

  /**
   * Rejects a staging vendor: sets staging status to REJECTED,
   * creates VendorApproval record with the mandatory comment,
   * and writes an AuditLog entry.
   * Throws 400 if comment is blank.
   */
  @requires: 'Approver'
  action rejectVendor(stagingID: UUID, comment: String(500))
    returns String;
}
