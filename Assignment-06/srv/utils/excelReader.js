const XLSX = require('xlsx');

function readExcelFile(fileData) {

    if (!fileData) {
        throw new Error('No Excel file was uploaded.');
    }

    const buffer = Buffer.from(fileData, 'base64');

    const workbook = XLSX.read(buffer, {
        type: 'buffer',
        cellDates: true
    });

    if (!workbook.SheetNames.length) {
        throw new Error('Excel file has no worksheet.');
    }

    const sheet =
        workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: ''
    });

    if (!rows.length) {
        throw new Error('Excel file is empty.');
    }

    return rows;
}

module.exports = {
    readExcelFile
};