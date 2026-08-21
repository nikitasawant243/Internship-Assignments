'use strict';

/**
 * GST Number Validator
 *
 * GST format (India):
 *   2-digit state code  +  5-char PAN letters  +  4-digit entity number
 *   +  1-char entity type  +  1-char check digit (Z default)  +  1 alphanumeric
 *
 * Full regex: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$
 */

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Validates a GST number string.
 *
 * @param {string} gst - The GST number to validate.
 * @returns {{ valid: boolean, message: string }}
 */
function validateGST(gst) {
  if (!gst || typeof gst !== 'string') {
    return { valid: false, message: 'GST Number is required.' };
  }

  const trimmed = gst.trim().toUpperCase();

  if (trimmed.length !== 15) {
    return {
      valid: false,
      message: `GST Number must be exactly 15 characters. Provided: ${trimmed.length}.`
    };
  }

  if (!GST_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: 'GST Number format is invalid. Expected format: SSAAAAANNNNAAZD (e.g. 27ABCDE1234F1Z5).'
    };
  }

  return { valid: true, message: '' };
}

module.exports = { validateGST };
