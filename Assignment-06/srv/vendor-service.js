const cds = require('@sap/cds');

const {
    uploadVendors
} = require('./utils/uploadService');

const {
    approveVendor,
    rejectVendor
} = require('./utils/approvalService');


module.exports = cds.service.impl(function () {

    const entities = this.entities;


    // ============================================
    // EXCEL UPLOAD
    // ============================================

    this.on('uploadVendors', async (req) => {

        try {

            const result = await uploadVendors(
                cds.tx(req),
                entities,
                req.data.fileName,
                req.data.fileData,
                req.user?.id || 'SYSTEM'
            );

            return result;

        } catch (error) {

            req.error(
                400,
                error.message
            );
        }
    });


    // ============================================
    // APPROVE
    // ============================================

    this.on('approveVendor', async (req) => {

        const result = await approveVendor(
            cds.tx(req),
            entities,
            req.data.vendorID,
            req.data.comment,
            req.user?.id || 'SYSTEM'
        );

        return result;
    });


    // ============================================
    // REJECT
    // ============================================

    this.on('rejectVendor', async (req) => {

        const result = await rejectVendor(
            cds.tx(req),
            entities,
            req.data.vendorID,
            req.data.comment,
            req.user?.id || 'SYSTEM'
        );

        return result;
    });

});