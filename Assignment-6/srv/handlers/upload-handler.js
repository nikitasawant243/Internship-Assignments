'use strict';

/**
 * Upload Handler
 *
 * Handles the `uploadVendors` action:
 *   1. Fetches reference data (countries, blacklist, existing DB records).
 *   2. Delegates to validation-handler for row-wise validation.
 *   3. Persists all rows to VendorStaging (PENDING for valid, INVALID for invalid).
 *   4. Writes one AuditLog entry per valid row (action = UPLOAD).
 *   5. Returns a structured UploadResult summary.
 */

const cds           = require('@sap/cds');
const { validateRows } = require('./validation-handler');
const { logAudit }     = require('./audit-handler');

/**
 * Registers the uploadVendors action handler on the given CAP service.
 *
 * @param {Object} srv - CAP service instance.
 */
function registerUploadHandler(srv) {
  srv.on('uploadVendors', async (req) => {
    const { payload } = req.data;

    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return req.error(400, 'Payload must be a non-empty array of vendor rows.');
    }

    const {
      VendorStaging,
      Country,
      BlacklistVendor,
      VendorMaster
    } = cds.entities('vendor.onboarding');

    const tx = cds.transaction(req);

    // ── Fetch reference data ───────────────────────────────────────────────
    const [countries, blacklist, existingMaster, existingStaging] = await Promise.all([
      tx.run(SELECT.from(Country).columns('code')),
      tx.run(SELECT.from(BlacklistVendor).columns('vendorCode')),
      tx.run(SELECT.from(VendorMaster).columns('gstNumber', 'panNumber', 'bankAccount')),
      tx.run(
        SELECT.from(VendorStaging)
          .where({ status: { in: ['PENDING', 'APPROVED'] } })
          .columns('gstNumber', 'panNumber', 'bankAccount')
      )
    ]);

    const validCountries  = countries.map(c => c.code);
    const blacklistCodes  = blacklist.map(b => b.vendorCode);
    const existingRecords = [...existingMaster, ...existingStaging];

    // ── Validate all rows ──────────────────────────────────────────────────
    const { valid, invalid } = validateRows(
      payload,
      validCountries,
      existingRecords,
      blacklistCodes
    );

    const uploadSessionID = cds.utils.uuid();
    const uploadedBy      = req.user.id || 'unknown';
    const uploadedAt      = new Date().toISOString();

    // ── Persist staging rows ───────────────────────────────────────────────
    const stagingEntries = [];

    // Valid rows → PENDING
    for (const { row, requiresApproval, approvalReasons } of valid) {
      const stagingID = cds.utils.uuid();
      stagingEntries.push({
        ID              : stagingID,
        rowNumber       : row.rowNumber,
        vendorCode      : String(row.vendorCode  || '').trim(),
        vendorName      : String(row.vendorName  || '').trim(),
        panNumber       : String(row.panNumber   || '').trim().toUpperCase(),
        gstNumber       : String(row.gstNumber   || '').trim().toUpperCase(),
        country_code    : String(row.country     || '').trim().toUpperCase(),
        bankAccount     : String(row.bankAccount || '').trim(),
        ifscCode        : String(row.ifscCode    || '').trim().toUpperCase(),
        creditLimit     : parseFloat(row.creditLimit),
        status          : 'PENDING',
        uploadSessionID,
        uploadedBy,
        uploadedAt,
        requiresApproval,
        approvalReasons : approvalReasons.join('; '),
        validationErrors: null
      });
    }

    // Invalid rows → INVALID (stored for display but not in workflow)
    for (const errRow of invalid) {
      // Find the original row to preserve all field data
      const originalRow = payload.find(r => r.rowNumber === errRow.rowNumber) || {};
      stagingEntries.push({
        ID              : cds.utils.uuid(),
        rowNumber       : errRow.rowNumber,
        vendorCode      : String(originalRow.vendorCode  || '').trim(),
        vendorName      : String(originalRow.vendorName  || '').trim(),
        panNumber       : String(originalRow.panNumber   || '').trim(),
        gstNumber       : String(originalRow.gstNumber   || '').trim(),
        country_code    : String(originalRow.country     || '').trim(),
        bankAccount     : String(originalRow.bankAccount || '').trim(),
        ifscCode        : String(originalRow.ifscCode    || '').trim(),
        creditLimit     : originalRow.creditLimit ? parseFloat(originalRow.creditLimit) : null,
        status          : 'INVALID',
        uploadSessionID,
        uploadedBy,
        uploadedAt,
        requiresApproval: false,
        approvalReasons : null,
        validationErrors: JSON.stringify(errRow.errors)
      });
    }

    if (stagingEntries.length > 0) {
      await tx.run(INSERT.into(VendorStaging).entries(stagingEntries));
    }

    // ── Audit: one entry per valid row ─────────────────────────────────────
    for (const { row } of valid) {
      const stagingEntry = stagingEntries.find(
        s => s.rowNumber === row.rowNumber && s.status === 'PENDING'
      );
      if (stagingEntry) {
        await logAudit(tx, {
          entityName: 'VendorStaging',
          entityID  : stagingEntry.ID,
          action    : 'UPLOAD',
          changedBy : uploadedBy,
          oldValue  : null,
          newValue  : stagingEntry
        });
      }
    }

    // ── Build flat errors array for response ──────────────────────────────
    const errors = invalid.flatMap(errRow =>
      errRow.errors.map(e => ({
        rowNumber : errRow.rowNumber,
        vendorCode: errRow.vendorCode,
        field     : e.field,
        message   : e.message
      }))
    );

    return {
      uploadSessionID,
      totalRows  : payload.length,
      validRows  : valid.length,
      invalidRows: invalid.length,
      errors
    };
  });
}

module.exports = { registerUploadHandler };
