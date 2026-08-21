'use strict';

/**
 * Vendor Service — Entry Point
 *
 * Wires all handler modules to the VendorService CAP service.
 * This file is intentionally thin: each handler is responsible
 * for its own action registrations.
 */

const { registerUploadHandler }   = require('./handlers/upload-handler');
const { registerApprovalHandler } = require('./handlers/approval-handler');

module.exports = (srv) => {
  // Register upload action (Uploader role)
  registerUploadHandler(srv);

  // Register approve / reject actions (Approver role)
  registerApprovalHandler(srv);
};
