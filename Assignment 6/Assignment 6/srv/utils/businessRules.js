'use strict';

/**
 * Business Rules Engine
 *
 * Determines whether a vendor row requires manual approval before being
 * committed to VendorMaster.
 *
 * Rules that trigger approval:
 *   1. Credit Limit exceeds ₹1 Crore  (10,000,000)
 *   2. Country is not 'IN'            (Foreign Vendor)
 *   3. Vendor Code is in the blacklist
 */

const ONE_CRORE = 10_000_000;   // ₹1,00,00,000
const TEN_CRORE = 100_000_000;  // ₹10,00,00,000

/**
 * Evaluates whether a vendor requires approval and validates the credit limit range.
 *
 * @param {Object}   vendor              - Single vendor row object.
 * @param {string[]} blacklistedCodes    - Array of blacklisted vendor codes (uppercase).
 * @returns {{
 *   requiresApproval: boolean,
 *   reasons: string[],
 *   creditLimitError: string|null
 * }}
 */
function evaluateVendor(vendor, blacklistedCodes = []) {
  const reasons = [];
  let creditLimitError = null;

  // ── Credit limit range validation ─────────────────────────────────────────
  const limit = parseFloat(vendor.creditLimit);

  if (isNaN(limit) || limit <= 0) {
    creditLimitError = 'Credit Limit must be a positive number greater than 0.';
  } else if (limit >= TEN_CRORE) {
    creditLimitError = `Credit Limit must be less than ₹10 Crores (₹${TEN_CRORE.toLocaleString('en-IN')}).`;
  }

  // ── Business rules for approval routing ───────────────────────────────────
  if (!creditLimitError && limit > ONE_CRORE) {
    reasons.push(`Credit Limit ₹${limit.toLocaleString('en-IN')} exceeds ₹1 Crore threshold`);
  }

  if (vendor.country && String(vendor.country).trim().toUpperCase() !== 'IN') {
    reasons.push(`Foreign vendor (Country: ${vendor.country})`);
  }

  const code = vendor.vendorCode ? String(vendor.vendorCode).trim().toUpperCase() : '';
  const blacklistSet = new Set(blacklistedCodes.map(c => c.trim().toUpperCase()));
  if (code && blacklistSet.has(code)) {
    reasons.push(`Vendor Code "${vendor.vendorCode}" is blacklisted`);
  }

  return {
    requiresApproval: reasons.length > 0,
    reasons,
    creditLimitError
  };
}

module.exports = { evaluateVendor, ONE_CRORE, TEN_CRORE };
