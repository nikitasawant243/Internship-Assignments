'use strict';

/**
 * Audit Handler
 *
 * Provides a single helper that appends one immutable row to the AuditLog
 * entity. All handlers call this after every significant state change.
 */

const cds = require('@sap/cds');

/**
 * Writes one audit log entry inside an existing transaction.
 *
 * @param {Object} tx  - CAP transaction (from cds.tx or the current request tx).
 * @param {Object} params
 * @param {string} params.entityName - Entity being changed (e.g. 'VendorStaging').
 * @param {string} params.entityID   - UUID of the changed record.
 * @param {string} params.action     - UPLOAD | APPROVE | REJECT.
 * @param {string} params.changedBy  - User ID / name.
 * @param {Object} [params.oldValue] - State before the change (will be JSON-serialised).
 * @param {Object} [params.newValue] - State after the change (will be JSON-serialised).
 */
async function logAudit(tx, { entityName, entityID, action, changedBy, oldValue, newValue }) {
  const { AuditLog } = cds.entities('vendor.onboarding');

  await tx.run(
    INSERT.into(AuditLog).entries({
      ID        : cds.utils.uuid(),
      entityName,
      entityID,
      action,
      changedBy,
      changedAt : new Date().toISOString(),
      oldValue  : oldValue  ? JSON.stringify(oldValue)  : null,
      newValue  : newValue  ? JSON.stringify(newValue)  : null
    })
  );
}

module.exports = { logAudit };
