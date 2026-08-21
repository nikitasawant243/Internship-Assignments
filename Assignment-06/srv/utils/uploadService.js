const cds = require('@sap/cds');

const { readExcelFile } = require('./excelReader');
const { validateVendor } = require('./excelValidator');
const { checkDuplicates } = require('./duplicateValidator');
const { checkBusinessRules } = require('./businessRules');
const { createAudit } = require('./auditService');

async function uploadVendors(tx, entities, fileName, fileData, user) {

    const {
        VendorStaging,
        VendorMaster,
        VendorAudit,
        Countries,
        BlacklistedVendors
    } = entities;

    // File validation
    if (!fileName || !fileName.toLowerCase().endsWith('.xlsx')) {
        throw new Error('Please upload a valid .xlsx file.');
    }

    // Read Excel
    const rows = readExcelFile(fileData);

    // Load countries
    const countries = await tx.run(
        SELECT.from(Countries)
    );

    const validCountries = new Set(
        countries.map(country => country.countryCode)
    );

    // Load blacklisted vendors
    const blacklistedVendors = await tx.run(
        SELECT.from(BlacklistedVendors)
    );

    const blacklistedCodes = new Set(
        blacklistedVendors.map(vendor => vendor.vendorCode)
    );

    // Load existing vendors
    const masterVendors = await tx.run(
        SELECT.from(VendorMaster)
    );

    const stagingVendors = await tx.run(
        SELECT.from(VendorStaging)
    );

    const existingData = {

        pan: new Set([
            ...masterVendors.map(v => v.panNumber),
            ...stagingVendors.map(v => v.panNumber)
        ]),

        gst: new Set([
            ...masterVendors.map(v => v.gstNumber),
            ...stagingVendors.map(v => v.gstNumber)
        ]),

        bank: new Set([
            ...masterVendors.map(v => v.bankAccount),
            ...stagingVendors.map(v => v.bankAccount)
        ])
    };

    // Duplicate sets for current Excel
    const excelSets = {
        pan: new Set(),
        gst: new Set(),
        bank: new Set()
    };

    const validRecords = [];
    const errors = [];

    // Process Excel rows
    for (let i = 0; i < rows.length; i++) {

        const row = rows[i];

        const validation = validateVendor(
            row,
            validCountries
        );

        const duplicateErrors = checkDuplicates(
            validation,
            excelSets,
            existingData
        );

        const businessRules = checkBusinessRules(
            validation,
            blacklistedCodes
        );

        const rowErrors = [
            ...validation.errors,
            ...duplicateErrors
        ];

        if (rowErrors.length > 0) {

            errors.push({
                rowNo: i + 2,
                vendorCode: validation.vendorCode,
                error: rowErrors.join('; ')
            });

            continue;
        }

        validRecords.push({

            ID: cds.utils.uuid(),

            vendorCode: validation.vendorCode,

            vendorName: validation.vendorName,

            panNumber: validation.panNumber,

            gstNumber: validation.gstNumber,

            country: validation.country,

            bankAccount: validation.bankAccount,

            ifsc: validation.ifsc,

            creditLimit: validation.creditLimit,

            approvalRequired:
                businessRules.requiresApproval,

            status: 'SUBMITTED',

            uploadedBy: user,

            uploadedAt: new Date()
        });
    }

    // If errors exist, don't upload
    if (errors.length > 0) {

        return {
            totalRecords: rows.length,
            successRecords: 0,
            failedRecords: errors.length,
            errors
        };
    }

    // Insert into staging
    await tx.run(
        INSERT.into(VendorStaging)
            .entries(validRecords)
    );

    // Audit upload
    for (const vendor of validRecords) {

        await createAudit(
            tx,
            VendorAudit,
            vendor.vendorCode,
            'UPLOAD',
            '',
            'SUBMITTED',
            user
        );
    }

    return {
        totalRecords: rows.length,
        successRecords: validRecords.length,
        failedRecords: 0,
        errors: []
    };
}

module.exports = {
    uploadVendors
};