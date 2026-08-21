'use strict';

/**
 * Validation Handler
 *
 * Orchestrates all field-level and cross-field validation for an array
 * of vendor rows. Returns { valid[], invalid[] } so the upload handler
 * can persist staging records correctly.
 */

const { validateGST }     = require('../utils/gstValidator');
const { validatePAN }     = require('../utils/panValidator');
const { findDuplicates }  = require('../utils/duplicateChecker');
const { evaluateVendor }  = require('../utils/businessRules');

const MANDATORY_FIELDS = [
  { key: 'vendorCode',  label: 'Vendor Code'  },
  { key: 'vendorName',  label: 'Vendor Name'  },
  { key: 'panNumber',   label: 'PAN Number'   },
  { key: 'gstNumber',   label: 'GST Number'   },
  { key: 'country',     label: 'Country'      },
  { key: 'bankAccount', label: 'Bank Account' },
  { key: 'ifscCode',    label: 'IFSC Code'    },
  { key: 'creditLimit', label: 'Credit Limit' }
];

/**
 * Validates all rows in a batch.
 *
 * @param {Array<Object>} rows           - Vendor rows from the Excel upload.
 * @param {Array<string>} validCountries - Array of valid country codes (from DB).
 * @param {Array<Object>} existingDB     - Existing VendorMaster + PENDING staging rows.
 * @param {Array<string>} blacklistCodes - Blacklisted vendor codes.
 * @returns {{
 *   valid: Array<{ row: Object, requiresApproval: boolean, approvalReasons: string[] }>,
 *   invalid: Array<{ rowNumber: number, vendorCode: string, errors: Array<{ field, message }> }>
 * }}
 */
function validateRows(rows, validCountries, existingDB, blacklistCodes) {
  // Collect per-row errors: rowIndex → [{ field, message }]
  const rowErrors = new Map();

  const addError = (idx, field, message) => {
    if (!rowErrors.has(idx)) rowErrors.set(idx, []);
    rowErrors.get(idx).push({ field, message });
  };

  const countrySet = new Set(validCountries.map(c => c.toUpperCase()));

  // ── Per-row field validation ─────────────────────────────────────────────
  rows.forEach((row, idx) => {
    // Mandatory fields
    for (const { key, label } of MANDATORY_FIELDS) {
      const val = row[key];
      const isEmpty = val === null || val === undefined || String(val).trim() === '';
      if (isEmpty) {
        addError(idx, key, `${label} is mandatory.`);
      }
    }

    // GST format
    if (row.gstNumber && String(row.gstNumber).trim()) {
      const gstResult = validateGST(row.gstNumber);
      if (!gstResult.valid) addError(idx, 'gstNumber', gstResult.message);
    }

    // PAN format
    if (row.panNumber && String(row.panNumber).trim()) {
      const panResult = validatePAN(row.panNumber);
      if (!panResult.valid) addError(idx, 'panNumber', panResult.message);
    }

    // Country lookup
    if (row.country && String(row.country).trim()) {
      if (!countrySet.has(String(row.country).trim().toUpperCase())) {
        addError(idx, 'country', `Country code "${row.country}" does not exist in the reference table.`);
      }
    }

    // Credit limit business rule + range
    if (row.creditLimit !== null && row.creditLimit !== undefined && String(row.creditLimit).trim() !== '') {
      const { creditLimitError } = evaluateVendor(row, []);
      if (creditLimitError) addError(idx, 'creditLimit', creditLimitError);
    }
  });

  // ── Duplicate check (intra-file + DB) ────────────────────────────────────
  const duplicateErrors = findDuplicates(rows, existingDB);
  duplicateErrors.forEach((errors, idx) => {
    errors.forEach(e => addError(idx, e.field, e.message));
  });

  // ── Categorise results ────────────────────────────────────────────────────
  const valid   = [];
  const invalid = [];

  rows.forEach((row, idx) => {
    if (rowErrors.has(idx)) {
      invalid.push({
        rowNumber : row.rowNumber,
        vendorCode: row.vendorCode || '',
        errors    : rowErrors.get(idx)
      });
    } else {
      // Evaluate approval routing for valid rows
      const { requiresApproval, reasons } = evaluateVendor(row, blacklistCodes);
      valid.push({ row, requiresApproval, approvalReasons: reasons });
    }
  });

  return { valid, invalid };
}

module.exports = { validateRows };
