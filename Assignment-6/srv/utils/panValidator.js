'use strict';

/**
 * PAN Number Validator
 *
 * PAN format (India):
 *   5 uppercase letters  +  4 digits  +  1 uppercase letter
 *   Example: ABCDE1234F
 *
 * Regex: ^[A-Z]{5}[0-9]{4}[A-Z]{1}$
 */

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * Validates a PAN number string.
 *
 * @param {string} pan - The PAN number to validate.
 * @returns {{ valid: boolean, message: string }}
 */
function validatePAN(pan) {
  if (!pan || typeof pan !== 'string') {
    return { valid: false, message: 'PAN Number is required.' };
  }

  const trimmed = pan.trim().toUpperCase();

  if (trimmed.length !== 10) {
    return {
      valid: false,
      message: `PAN Number must be exactly 10 characters. Provided: ${trimmed.length}.`
    };
  }

  if (!PAN_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: 'PAN Number format is invalid. Expected format: ABCDE1234F (5 letters + 4 digits + 1 letter).'
    };
  }

  return { valid: true, message: '' };
}

module.exports = { validatePAN };
