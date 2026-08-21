'use strict';

/**
 * Approval Handler
 *
 * Handles the `approveVendor` and `rejectVendor` actions:
 *
 *   approveVendor:
 *     - Fetches staging record; errors if not PENDING.
 *     - Copies record to VendorMaster.
 *     - Sets staging status to APPROVED.
 *     - Creates VendorApproval record.
 *     - Writes AuditLog entry.
 *
 *   rejectVendor:
 *     - Requires non-empty comment (throws 400 otherwise).
 *     - Sets staging status to REJECTED.
 *     - Creates VendorApproval record.
 *     - Writes AuditLog entry.
 */

const cds          = require('@sap/cds');
const { logAudit } = require('./audit-handler');

/**
 * Registers the approveVendor and rejectVendor action handlers.
 *
 * @param {Object} srv - CAP service instance.
 */
function registerApprovalHandler(srv) {

  // ── approveVendor ──────────────────────────────────────────────────────────
  srv.on('approveVendor', async (req) => {
    const { stagingID, comment } = req.data;

    if (!stagingID) return req.error(400, 'stagingID is required.');

    const {
      VendorStaging,
      VendorMaster,
      VendorApproval
    } = cds.entities('vendor.onboarding');

    const tx = cds.transaction(req);

    // Fetch staging record
    const staging = await tx.run(
      SELECT.one.from(VendorStaging).where({ ID: stagingID })
    );

    if (!staging)            return req.error(404, `Staging record ${stagingID} not found.`);
    if (staging.status !== 'PENDING')
      return req.error(409, `Vendor is already ${staging.status}. Cannot approve.`);

    const approvedBy = req.user.id || 'unknown';
    const approvedAt = new Date().toISOString();

    // Copy to VendorMaster
    const masterID = cds.utils.uuid();
    await tx.run(
      INSERT.into(VendorMaster).entries({
        ID          : masterID,
        vendorCode  : staging.vendorCode,
        vendorName  : staging.vendorName,
        panNumber   : staging.panNumber,
        gstNumber   : staging.gstNumber,
        country_code: staging.country_code,
        bankAccount : staging.bankAccount,
        ifscCode    : staging.ifscCode,
        creditLimit : staging.creditLimit,
        stagingID   : staging.ID,
        approvedBy,
        approvedAt
      })
    );

    // Update staging status
    await tx.run(
      UPDATE(VendorStaging).set({ status: 'APPROVED' }).where({ ID: stagingID })
    );

    // Create VendorApproval record
    await tx.run(
      INSERT.into(VendorApproval).entries({
        ID       : cds.utils.uuid(),
        staging_ID: stagingID,
        action   : 'APPROVE',
        comment  : comment || '',
        actionBy : approvedBy,
        actionAt : approvedAt
      })
    );

    // Audit log
    await logAudit(tx, {
      entityName: 'VendorStaging',
      entityID  : stagingID,
      action    : 'APPROVE',
      changedBy : approvedBy,
      oldValue  : { ...staging, status: 'PENDING' },
      newValue  : { ...staging, status: 'APPROVED', approvedBy, approvedAt }
    });

    return `Vendor "${staging.vendorName}" approved successfully.`;
  });

  // ── rejectVendor ───────────────────────────────────────────────────────────
  srv.on('rejectVendor', async (req) => {
    const { stagingID, comment } = req.data;

    if (!stagingID) return req.error(400, 'stagingID is required.');

    // Comment is mandatory for rejection
    if (!comment || String(comment).trim() === '') {
      return req.error(400, 'A comment is required when rejecting a vendor.');
    }

    const { VendorStaging, VendorApproval } = cds.entities('vendor.onboarding');
    const tx = cds.transaction(req);

    const staging = await tx.run(
      SELECT.one.from(VendorStaging).where({ ID: stagingID })
    );

    if (!staging) return req.error(404, `Staging record ${stagingID} not found.`);
    if (staging.status !== 'PENDING')
      return req.error(409, `Vendor is already ${staging.status}. Cannot reject.`);

    const rejectedBy = req.user.id || 'unknown';
    const rejectedAt = new Date().toISOString();

    // Update staging status
    await tx.run(
      UPDATE(VendorStaging).set({ status: 'REJECTED' }).where({ ID: stagingID })
    );

    // Create VendorApproval record
    await tx.run(
      INSERT.into(VendorApproval).entries({
        ID        : cds.utils.uuid(),
        staging_ID: stagingID,
        action    : 'REJECT',
        comment   : comment.trim(),
        actionBy  : rejectedBy,
        actionAt  : rejectedAt
      })
    );

    // Audit log
    await logAudit(tx, {
      entityName: 'VendorStaging',
      entityID  : stagingID,
      action    : 'REJECT',
      changedBy : rejectedBy,
      oldValue  : { ...staging, status: 'PENDING' },
      newValue  : { ...staging, status: 'REJECTED', rejectedBy, rejectedAt, comment }
    });

    return `Vendor "${staging.vendorName}" rejected.`;
  });
}

module.exports = { registerApprovalHandler };
