const cds = require('@sap/cds');

async function createAudit(
    tx,
    VendorAudit,
    vendorCode,
    action,
    oldValue,
    newValue,
    user
) {

    await tx.run(
        INSERT.into(VendorAudit).entries({

            ID: cds.utils.uuid(),

            vendorCode,

            action,

            changedBy: user || 'SYSTEM',

            changedAt: new Date(),

            oldValue,

            newValue
        })
    );
}

module.exports = {
    createAudit
};