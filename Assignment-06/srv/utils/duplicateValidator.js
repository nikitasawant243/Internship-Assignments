function checkDuplicates(
    data,
    excelSets,
    existingData
) {

    const errors = [];

    const {
        panNumber,
        gstNumber,
        bankAccount
    } = data;

    // PAN
    if (panNumber) {

        if (excelSets.pan.has(panNumber)) {
            errors.push('Duplicate PAN in Excel');
        }

        if (existingData.pan.has(panNumber)) {
            errors.push('PAN already exists');
        }

        excelSets.pan.add(panNumber);
    }

    // GST
    if (gstNumber) {

        if (excelSets.gst.has(gstNumber)) {
            errors.push('Duplicate GST in Excel');
        }

        if (existingData.gst.has(gstNumber)) {
            errors.push('GST already exists');
        }

        excelSets.gst.add(gstNumber);
    }

    // Bank Account
    if (bankAccount) {

        if (excelSets.bank.has(bankAccount)) {
            errors.push('Duplicate Bank Account in Excel');
        }

        if (existingData.bank.has(bankAccount)) {
            errors.push('Bank Account already exists');
        }

        excelSets.bank.add(bankAccount);
    }

    return errors;
}

module.exports = {
    checkDuplicates
};