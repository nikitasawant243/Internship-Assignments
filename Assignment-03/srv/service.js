const cds = require('@sap/cds');

module.exports = class EmployeeService extends cds.ApplicationService {

    async init() {

        const { Employees } = this.entities;

        // Auto-generate a unique sequential employee code on every CREATE.
        // Fires on draftActivate (the real CREATE), after the user fills the form.
        this.before('CREATE', Employees, async (req) => {

            // Use the fully-qualified DB entity name string — this bypasses the
            // service projection (which carries virtual Draft fields) and queries
            // the raw SQLite table directly, avoiding "Virtual elements are not
            // allowed in expressions" errors.
            const rows = await SELECT
                .from('employee.management.Employees')
                .columns('employeeCode');

            // Find the highest existing EMP### number so codes are never reused
            let maxNum = 0;
            for (const { employeeCode } of rows) {
                if (employeeCode && /^EMP\d+$/i.test(employeeCode)) {
                    const n = parseInt(employeeCode.replace(/^EMP/i, ''), 10);
                    if (n > maxNum) maxNum = n;
                }
            }

            const next = String(maxNum + 1).padStart(3, '0');
            req.data.employeeCode = `EMP${next}`;

        });

        return super.init();
    }

};
