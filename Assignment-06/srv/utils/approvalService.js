const cds = require('@sap/cds');

async function approveVendor(tx, entities, vendorID, comment, user) {

    const {
        VendorStaging,
        VendorMaster,
        VendorApproval,
        VendorAudit
    } = entities;

    const vendor = await tx.run(
        SELECT.one
            .from(VendorStaging)
            .where({ ID: vendorID })
    );

    if (!vendor) {
        return 'Vendor not found.';
    }

    if (vendor.status !== 'SUBMITTED') {
        return 'Only submitted vendors can be approved.';
    }

    // Move vendor to Vendor Master
    await tx.run(
        INSERT.into(VendorMaster).entries({
            vendorCode: vendor.vendorCode,
            vendorName: vendor.vendorName,
            panNumber: vendor.panNumber,
            gstNumber: vendor.gstNumber,
            country: vendor.country,
            bankAccount: vendor.bankAccount,
            ifsc: vendor.ifsc,
            creditLimit: vendor.creditLimit,
            createdBy: user,
            createdAt: new Date()
        })
    );

    // Update staging status
    await tx.run(
        UPDATE(VendorStaging)
            .set({ status: 'APPROVED' })
            .where({ ID: vendorID })
    );

    // Save approval record
    await tx.run(
        INSERT.into(VendorApproval).entries({
            ID: cds.utils.uuid(),
            vendorCode: vendor.vendorCode,
            action: 'APPROVE',
            comment: comment || '',
            actionBy: user,
            actionAt: new Date()
        })
    );

    // Save audit record
    await tx.run(
        INSERT.into(VendorAudit).entries({
            ID: cds.utils.uuid(),
            vendorCode: vendor.vendorCode,
            action: 'APPROVE',
            changedBy: user,
            changedAt: new Date(),
            oldValue: 'SUBMITTED',
            newValue: 'APPROVED'
        })
    );

    return 'Vendor approved successfully.';
}


async function rejectVendor(tx, entities, vendorID, comment, user) {

    const {
        VendorStaging,
        VendorApproval,
        VendorAudit
    } = entities;

    // Comment is mandatory
    if (!comment || !comment.trim()) {
        return 'Rejection comment is mandatory.';
    }

    const vendor = await tx.run(
        SELECT.one
            .from(VendorStaging)
            .where({ ID: vendorID })
    );

    if (!vendor) {
        return 'Vendor not found.';
    }

    if (vendor.status !== 'SUBMITTED') {
        return 'Only submitted vendors can be rejected.';
    }

    // Update staging status
    await tx.run(
        UPDATE(VendorStaging)
            .set({ status: 'REJECTED' })
            .where({ ID: vendorID })
    );

    // Save rejection record
    await tx.run(
        INSERT.into(VendorApproval).entries({
            ID: cds.utils.uuid(),
            vendorCode: vendor.vendorCode,
            action: 'REJECT',
            comment: comment.trim(),
            actionBy: user,
            actionAt: new Date()
        })
    );

    // Save audit record
    await tx.run(
        INSERT.into(VendorAudit).entries({
            ID: cds.utils.uuid(),
            vendorCode: vendor.vendorCode,
            action: 'REJECT',
            changedBy: user,
            changedAt: new Date(),
            oldValue: 'SUBMITTED',
            newValue: 'REJECTED'
        })
    );

    return 'Vendor rejected successfully.';
}


module.exports = {
    approveVendor,
    rejectVendor
};