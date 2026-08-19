'use strict';

const cds  = require('@sap/cds');
const XLSX = require('xlsx');

const REQUIRED_HEADERS = [
    'Employee ID',
    'Employee Name',
    'Email',
    'Department',
    'Manager ID',
    'Joining Date',
    'Salary',
    'Location'
];

module.exports = cds.service.impl(function () {

    const { Employees, Departments, Managers, UploadErrors } = this.entities;

    // ================================================================
    // ACTION: uploadEmployees
    // ================================================================
    this.on('uploadEmployees', async (req) => {
        try {
            const { fileName, fileContent } = req.data;

            // --------------------------------------------------------
            // 1. FILE-LEVEL GUARDS
            // --------------------------------------------------------
            if (!fileName) {
                return response(false, 'File name is required.', 0, 0, 0, []);
            }
            if (!fileName.toLowerCase().endsWith('.xlsx')) {
                return response(false, 'Only .xlsx files are allowed.', 0, 0, 0, []);
            }
            if (!fileContent) {
                return response(false, 'File content is empty.', 0, 0, 0, []);
            }

            // --------------------------------------------------------
            // 2. PARSE EXCEL
            // --------------------------------------------------------
            const workbook = XLSX.read(
                Buffer.from(fileContent, 'base64'),
                { type: 'buffer', cellDates: true }
            );

            if (!workbook.SheetNames.length) {
                return response(false, 'Excel file contains no sheets.', 0, 0, 0, []);
            }

            const rows = XLSX.utils.sheet_to_json(
                workbook.Sheets[workbook.SheetNames[0]],
                { defval: '' }
            );

            if (!rows.length) {
                return response(false, 'Excel file contains no data rows.', 0, 0, 0, []);
            }

            // --------------------------------------------------------
            // 3. HEADER VALIDATION
            // --------------------------------------------------------
            const actualHeaders   = Object.keys(rows[0]);
            const missingHeaders  = REQUIRED_HEADERS.filter(h => !actualHeaders.includes(h));
            if (missingHeaders.length) {
                return response(
                    false,
                    'Missing columns: ' + missingHeaders.join(', '),
                    rows.length, 0, rows.length, []
                );
            }

            // --------------------------------------------------------
            // 4. LOAD REFERENCE DATA
            // --------------------------------------------------------
            const [deptData, mgrData, empData] = await Promise.all([
                SELECT.from(Departments),
                SELECT.from(Managers),
                SELECT.from(Employees)
            ]);

            const validDepts    = new Set(deptData.map(d => d.deptCode));
            const validMgrs     = new Set(mgrData.map(m => m.managerId));
            const existingEmpIds = new Set(empData.map(e => e.employeeId));

            // --------------------------------------------------------
            // 5. PER-ROW VALIDATION
            // --------------------------------------------------------
            const seenInExcel  = new Set();
            const errorRecords = [];
            const validEmps    = [];

            for (let i = 0; i < rows.length; i++) {
                const row   = rows[i];
                const rowNo = i + 2;
                const errs  = [];

                // Read & trim
                const employeeId   = String(row['Employee ID']   || '').trim();
                const employeeName = String(row['Employee Name'] || '').trim();
                const email        = String(row['Email']         || '').trim();
                const department   = String(row['Department']    || '').trim();
                const managerId    = String(row['Manager ID']    || '').trim();
                const joiningDate  = row['Joining Date'];
                const salary       = row['Salary'];
                const location     = String(row['Location']      || '').trim();

                // ---- Mandatory fields ----
                if (!employeeId)   errs.push('Employee ID is missing');
                if (!employeeName) errs.push('Employee Name is missing');
                if (!email)        errs.push('Email is missing');
                if (!department)   errs.push('Department is missing');
                if (!joiningDate)  errs.push('Joining Date is missing');

                // ---- Email format ----
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    errs.push('Invalid email format (expected: name@domain.com)');
                }

                // ---- Salary ----
                if (salary === '' || salary === null || salary === undefined) {
                    // optional — no error
                } else {
                    const num = Number(salary);
                    if (Number.isNaN(num))   errs.push('Salary must be a number');
                    else if (num <= 0)       errs.push('Salary must be greater than 0');
                    else if (num >= 5000000) errs.push('Salary must be less than 50,00,000');
                }

                // ---- Joining Date ----
                let parsedDate = null;
                if (joiningDate) {
                    parsedDate = new Date(joiningDate);
                    if (Number.isNaN(parsedDate.getTime())) {
                        errs.push('Joining Date is not a valid date');
                        parsedDate = null;
                    } else {
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        if (parsedDate > today) {
                            errs.push('Joining Date cannot be a future date');
                        }
                    }
                }

                // ---- Excel duplicate ----
                if (employeeId) {
                    if (seenInExcel.has(employeeId)) {
                        errs.push('Duplicate Employee ID within this Excel file');
                    } else {
                        seenInExcel.add(employeeId);
                    }
                }

                // ---- DB duplicate ----
                if (employeeId && existingEmpIds.has(employeeId)) {
                    errs.push('Employee ID already exists in the database');
                }

                // ---- Department ref check ----
                if (department && !validDepts.has(department)) {
                    errs.push(`Department "${department}" is not valid (allowed: IT, HR, Finance)`);
                }

                // ---- Manager ref check ----
                if (managerId && !validMgrs.has(managerId)) {
                    errs.push(`Manager ID "${managerId}" does not exist`);
                }

                // ---- Collect result ----
                if (errs.length) {
                    errorRecords.push({
                        rowNo,
                        employeeId: employeeId || null,
                        errorMessage: errs.join(' | ')
                    });
                } else {
                    // Format date as YYYY-MM-DD for CAP Date field
                    const dateStr = parsedDate
                        ? parsedDate.toISOString().substring(0, 10)
                        : null;

                    validEmps.push({
                        employeeId,
                        employeeName,
                        email,
                        department,
                        managerId: managerId || null,
                        joiningDate: dateStr,
                        salary: (salary === '' || salary === null || salary === undefined)
                            ? null
                            : Number(salary),
                        location: location || null
                    });
                }
            }

            // --------------------------------------------------------
            // 6. ALL-OR-NOTHING — ERRORS EXIST
            // --------------------------------------------------------
            if (errorRecords.length) {
                const sessionId = cds.utils.uuid();
                const now       = new Date().toISOString();

                await INSERT.into(UploadErrors).entries(
                    errorRecords.map(e => ({
                        ID:              cds.utils.uuid(),
                        uploadSessionId: sessionId,
                        rowNo:           e.rowNo,
                        employeeId:      e.employeeId,
                        errorMessage:    e.errorMessage,
                        createdAt:       now
                    }))
                );

                return response(
                    false,
                    'Upload rejected — validation errors found. No records were inserted.',
                    rows.length,
                    0,
                    errorRecords.length,
                    errorRecords
                );
            }

            // --------------------------------------------------------
            // 7. INSERT VALID EMPLOYEES
            // --------------------------------------------------------
            await INSERT.into(Employees).entries(validEmps);

            return response(
                true,
                'All records uploaded successfully.',
                rows.length,
                validEmps.length,
                0,
                []
            );

        } catch (err) {
            console.error('uploadEmployees error:', err);
            return response(false, 'Unexpected server error: ' + err.message, 0, 0, 0, []);
        }
    });

});

// ----------------------------------------------------------------
// Helper
// ----------------------------------------------------------------
function response(success, message, totalRecords, successRecords, failedRecords, errors) {
    return { success, message, totalRecords, successRecords, failedRecords, errors };
}
