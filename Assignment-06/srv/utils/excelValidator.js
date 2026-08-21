function validateVendor(row, validCountries) {

    const errors = [];

    const vendorCode = String(row['Vendor Code'] || '').trim();
    const vendorName = String(row['Vendor Name'] || '').trim();
    const panNumber = String(row['PAN Number'] || '').trim().toUpperCase();
    const gstNumber = String(row['GST Number'] || '').trim().toUpperCase();
    const country = String(row['Country'] || '').trim().toUpperCase();
    const bankAccount = String(row['Bank Account'] || '').trim();
    const ifsc = String(row['IFSC'] || '').trim().toUpperCase();
    const creditLimit = Number(row['Credit Limit']);

    // Mandatory fields
    if (!vendorCode) errors.push('Vendor Code Missing');
    if (!vendorName) errors.push('Vendor Name Missing');
    if (!panNumber) errors.push('PAN Number Missing');
    if (!gstNumber) errors.push('GST Number Missing');
    if (!country) errors.push('Country Missing');
    if (!bankAccount) errors.push('Bank Account Missing');
    if (!ifsc) errors.push('IFSC Missing');

    if (row['Credit Limit'] === '') {
        errors.push('Credit Limit Missing');
    }

    // PAN: ABCDE1234F
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (panNumber && !panRegex.test(panNumber)) {
        errors.push('Invalid PAN Number');
    }

    // GST: 15 characters
    const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (
        gstNumber &&
        (
            gstNumber.length !== 15 ||
            !gstRegex.test(gstNumber)
        )
    ) {
        errors.push('Invalid GST Number');
    }

    // Country
    if (
        country &&
        !validCountries.has(country)
    ) {
        errors.push('Invalid Country');
    }

    // Credit Limit
    if (
        isNaN(creditLimit) ||
        creditLimit <= 0 ||
        creditLimit >= 100000000
    ) {
        errors.push(
            'Credit Limit must be greater than 0 and less than 10 Crores'
        );
    }

    return {
        errors,
        vendorCode,
        vendorName,
        panNumber,
        gstNumber,
        country,
        bankAccount,
        ifsc,
        creditLimit
    };
}

module.exports = {
    validateVendor
};