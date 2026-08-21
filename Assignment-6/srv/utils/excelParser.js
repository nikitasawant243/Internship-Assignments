'use strict';

/**
 * Server-side Excel Parser
 *
 * Uses the `xlsx` npm package to parse a raw Buffer received from a file upload
 * and returns an array of normalized row objects.
 *
 * Column header mapping (case-insensitive, trimmed):
 *   "Vendor Code"   → vendorCode
 *   "Vendor Name"   → vendorName
 *   "PAN Number"    → panNumber
 *   "GST Number"    → gstNumber
 *   "Country"       → country
 *   "Bank Account"  → bankAccount
 *   "IFSC"          → ifscCode
 *   "Credit Limit"  → creditLimit
 */

const XLSX = require('xlsx');

// Map from normalised header text → camelCase field name
const HEADER_MAP = {
  'vendor code'  : 'vendorCode',
  'vendor name'  : 'vendorName',
  'pan number'   : 'panNumber',
  'pan no'       : 'panNumber',
  'gst number'   : 'gstNumber',
  'gst no'       : 'gstNumber',
  'country'      : 'country',
  'bank account' : 'bankAccount',
  'bank account no' : 'bankAccount',
  'ifsc'         : 'ifscCode',
  'ifsc code'    : 'ifscCode',
  'credit limit' : 'creditLimit'
};

/**
 * Parses an Excel buffer and returns normalized vendor row objects.
 *
 * @param {Buffer} buffer - Raw file buffer (from multipart upload or fs.readFileSync).
 * @returns {Array<Object>} Array of row objects with camelCase keys and 1-based rowNumber.
 */
function parseExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });

  // Use the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('Excel file contains no sheets.');
  }

  const sheet = workbook.Sheets[sheetName];

  // Convert to array-of-arrays to handle header mapping manually
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawRows.length < 2) {
    return []; // No data rows
  }

  // Build column index → field name mapping from the first row (headers)
  const headerRow = rawRows[0];
  const colMap = {}; // colIndex → camelCase field name

  headerRow.forEach((cell, idx) => {
    const normalized = String(cell).trim().toLowerCase();
    if (HEADER_MAP[normalized]) {
      colMap[idx] = HEADER_MAP[normalized];
    }
  });

  // Parse data rows (skip header)
  const rows = [];
  for (let i = 1; i < rawRows.length; i++) {
    const rawRow = rawRows[i];

    // Skip entirely empty rows
    if (rawRow.every(cell => cell === '' || cell === null || cell === undefined)) {
      continue;
    }

    const row = { rowNumber: i }; // 1-based (header is row 0, first data row is 1)

    Object.entries(colMap).forEach(([colIdx, fieldName]) => {
      let value = rawRow[colIdx];

      // Normalise numeric credit limit
      if (fieldName === 'creditLimit') {
        value = value === '' ? null : parseFloat(value);
      } else {
        value = value === null || value === undefined ? '' : String(value).trim();
      }

      row[fieldName] = value;
    });

    rows.push(row);
  }

  return rows;
}

module.exports = { parseExcel };
