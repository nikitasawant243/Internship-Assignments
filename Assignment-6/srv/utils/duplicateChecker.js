'use strict';

/**
 * Duplicate Checker
 *
 * Checks for duplicate values in three uniqueness-constrained fields:
 *   - gstNumber
 *   - panNumber
 *   - bankAccount
 *
 * Duplicates are flagged in two passes:
 *   1. Intra-file: rows within the uploaded batch that share a value.
 *   2. DB-level:   rows whose value already exists in VendorMaster or
 *                  other PENDING/APPROVED VendorStaging records.
 */

const UNIQUE_FIELDS = ['gstNumber', 'panNumber', 'bankAccount'];

/**
 * Finds all duplicate violations across an array of vendor rows and against
 * already-existing DB records.
 *
 * @param {Array<Object>} rows            - Uploaded vendor rows (0-based index matches rowNumber).
 * @param {Array<Object>} existingRecords - Existing DB records (VendorMaster + active staging rows).
 * @returns {Map<number, Array<{ field: string, message: string }>>}
 *   A map keyed by row index (0-based) → array of error objects.
 */
function findDuplicates(rows, existingRecords) {
  const errors = new Map(); // rowIndex → [{ field, message }]

  const addError = (rowIndex, field, message) => {
    if (!errors.has(rowIndex)) errors.set(rowIndex, []);
    errors.get(rowIndex).push({ field, message });
  };

  for (const field of UNIQUE_FIELDS) {
    // ── Pass 1: intra-file duplicates ────────────────────────────────────────
    const seen = new Map(); // value → first row index that had it

    rows.forEach((row, idx) => {
      const value = row[field] ? String(row[field]).trim().toUpperCase() : null;
      if (!value) return;

      if (seen.has(value)) {
        const firstIdx = seen.get(value);
        // Flag both the first occurrence and the current one
        addError(firstIdx, field, `Duplicate ${field} "${value}" also found at row ${idx + 1}.`);
        addError(idx, field, `Duplicate ${field} "${value}" also found at row ${firstIdx + 1}.`);
      } else {
        seen.set(value, idx);
      }
    });

    // ── Pass 2: against existing DB records ──────────────────────────────────
    const dbValues = new Set(
      existingRecords
        .map(r => (r[field] ? String(r[field]).trim().toUpperCase() : null))
        .filter(Boolean)
    );

    rows.forEach((row, idx) => {
      const value = row[field] ? String(row[field]).trim().toUpperCase() : null;
      if (!value) return;

      if (dbValues.has(value)) {
        addError(idx, field, `${field} "${value}" already exists in the database.`);
      }
    });
  }

  return errors;
}

module.exports = { findDuplicates };
