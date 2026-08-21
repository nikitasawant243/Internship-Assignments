function checkBusinessRules(
    vendor,
    blacklistedCodes
) {

    const reasons = [];

    // Credit Limit > 1 Crore
    if (vendor.creditLimit > 10000000) {
        reasons.push('Credit Limit Greater Than 1 Crore');
    }

    // Foreign Vendor
    if (vendor.country !== 'IN') {
        reasons.push('Foreign Vendor');
    }

    // Blacklisted Vendor
    if (blacklistedCodes.has(vendor.vendorCode)) {
        reasons.push('Blacklisted Vendor');
    }

    return {
        requiresApproval: reasons.length > 0,
        reasons
    };
}

module.exports = {
    checkBusinessRules
};