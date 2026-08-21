const cds = require('@sap/cds');

const { SELECT } = cds.ql;

module.exports = cds.service.impl(function () {

    /*
     * =========================================================
     * SERVICE ENTITIES
     * =========================================================
     */

    const {
        PurchaseRequisitions,
        PRAgingReport,
        DelayedApprovals,
        DepartmentBottlenecks
    } = this.entities;


    /*
     * =========================================================
     * DATABASE ENTITIES
     * =========================================================
     */

    const db = cds.entities('pr.bottleneck');

    const {
        PurchaseRequisitions: dbPurchaseRequisitions,
        Departments: dbDepartments
    } = db;


    /*
     * =========================================================
     * DATE UTILITIES
     * =========================================================
     */

    function getToday() {

        const today = new Date();

        return today.toISOString().split('T')[0];
    }


    function toDate(value) {

        if (!value) {
            return null;
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return null;
        }

        return date;
    }


    function daysBetween(startDate, endDate) {

        const start = toDate(startDate);
        const end = toDate(endDate);

        if (!start || !end) {
            return null;
        }

        const difference =
            end.getTime() - start.getTime();

        return Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );
    }


    /*
     * =========================================================
     * PR AGE
     *
     * Pending:
     *     Today - Created Date
     *
     * Approved:
     *     Approval Date - Created Date
     * =========================================================
     */

    function calculatePRAge(pr) {

        if (!pr.createdDate) {
            return null;
        }

        const endDate =
            pr.approvalDate ||
            getToday();

        return daysBetween(
            pr.createdDate,
            endDate
        );
    }


    /*
     * =========================================================
     * APPROVAL CYCLE
     * =========================================================
     */

    function calculateApprovalCycle(pr) {

        if (
            !pr.createdDate ||
            !pr.approvalDate
        ) {
            return null;
        }

        return daysBetween(
            pr.createdDate,
            pr.approvalDate
        );
    }


    /*
     * =========================================================
     * SLA STATUS
     * =========================================================
     */

    function calculateSLAStatus(pr) {

        const age =
            calculatePRAge(pr);

        const sla =
            Number(pr.slaDays);


        if (age === null) {
            return 'UNKNOWN';
        }


        if (!sla || sla <= 0) {
            return 'NO_SLA';
        }


        if (age > sla) {
            return 'BREACHED';
        }


        if (age >= sla - 1) {
            return 'AT_RISK';
        }


        return 'WITHIN_SLA';
    }


    /*
     * =========================================================
     * RISK LEVEL
     * =========================================================
     */

    function calculateRisk(pr) {

        /*
         * Approved PRs are no longer
         * considered operationally at risk.
         */

        if (
            pr.status === 'Approved' ||
            pr.approvalStatus === 'Approved'
        ) {
            return 'LOW';
        }


        const age =
            calculatePRAge(pr);

        const sla =
            Number(pr.slaDays);


        if (
            age === null ||
            !sla ||
            sla <= 0
        ) {
            return 'LOW';
        }


        const ratio =
            age / sla;


        if (ratio >= 1) {
            return 'HIGH';
        }


        if (ratio >= 0.75) {
            return 'MEDIUM';
        }


        return 'LOW';
    }


    /*
     * =========================================================
     * SLA BREACH PROBABILITY
     *
     * Temporary rule-based calculation.
     *
     * Later this can be replaced with
     * a machine-learning model.
     * =========================================================
     */

    function calculateProbability(pr) {

        if (
            pr.status === 'Approved' ||
            pr.approvalStatus === 'Approved'
        ) {
            return 0;
        }


        const age =
            calculatePRAge(pr);

        const sla =
            Number(pr.slaDays);


        if (
            age === null ||
            !sla ||
            sla <= 0
        ) {
            return 0;
        }


        let probability =
            age / sla;


        probability =
            Math.max(
                0,
                Math.min(
                    1,
                    probability
                )
            );


        return Number(
            probability.toFixed(2)
        );
    }


    /*
     * =========================================================
     * AGING CATEGORY
     * =========================================================
     */

    function calculateAgingCategory(age) {

        if (age === null || age === undefined) {
            return 'UNKNOWN';
        }


        if (age <= 2) {
            return 'NORMAL';
        }


        if (age <= 5) {
            return 'WARNING';
        }


        if (age <= 7) {
            return 'HIGH';
        }


        return 'CRITICAL';
    }


    /*
     * =========================================================
     * DELAY DAYS
     * =========================================================
     */

    function calculateDelayDays(pr) {

        const approvalCycle =
            calculateApprovalCycle(pr);

        const sla =
            Number(pr.slaDays);


        if (
            approvalCycle === null ||
            !sla
        ) {
            return 0;
        }


        return Math.max(
            0,
            approvalCycle - sla
        );
    }


    /*
     * =========================================================
     * DELAY PERCENTAGE
     * =========================================================
     */

    function calculateDelayPercentage(pr) {

        const approvalCycle =
            calculateApprovalCycle(pr);

        const sla =
            Number(pr.slaDays);


        if (
            approvalCycle === null ||
            !sla ||
            sla <= 0
        ) {
            return 0;
        }


        const delayDays =
            Math.max(
                0,
                approvalCycle - sla
            );


        return Number(
            (
                delayDays /
                sla *
                100
            ).toFixed(2)
        );
    }


    /*
     * =========================================================
     * READ PURCHASE REQUISITIONS
     * =========================================================
     */

    this.after(
        'READ',
        PurchaseRequisitions,
        data => {

            const records =
                Array.isArray(data)
                    ? data
                    : [data];


            for (const pr of records) {

                if (!pr) {
                    continue;
                }


                pr.PR_Age_Days =
                    calculatePRAge(pr);


                pr.Approval_Cycle_Days =
                    calculateApprovalCycle(pr);


                pr.SLA_Status =
                    calculateSLAStatus(pr);


                pr.Risk_Level =
                    calculateRisk(pr);


                pr.SLA_Breach_Probability =
                    calculateProbability(pr);
            }
        }
    );


    /*
     * =========================================================
     * PR AGING REPORT
     * =========================================================
     */

    this.on(
        'READ',
        PRAgingReport,
        async () => {

            /*
             * Read PR data
             */

            const prs =
                await cds.run(
                    SELECT.from(
                        dbPurchaseRequisitions
                    )
                );


            /*
             * Read department master data
             */

            const departments =
                await cds.run(
                    SELECT.from(
                        dbDepartments
                    )
                );


            /*
             * Create department lookup
             */

            const departmentMap =
                new Map(
                    departments.map(
                        department => [
                            department.departmentCode,
                            department
                        ]
                    )
                );


            /*
             * Build aging report
             */

            return prs.map(pr => {

                const department =
                    departmentMap.get(
                        pr.departmentCode
                    );


                const ageDays =
                    calculatePRAge(pr);


                return {

                    PRNumber:
                        pr.PRNumber,

                    PRItem:
                        pr.PRItem,

                    createdBy:
                        pr.createdBy,

                    createdDate:
                        pr.createdDate,

                    departmentCode:
                        pr.departmentCode,

                    departmentName:
                        department
                            ? department.departmentName
                            : 'Unknown',

                    description:
                        pr.description,

                    status:
                        pr.status,

                    approvalDate:
                        pr.approvalDate,

                    slaDays:
                        Number(
                            pr.slaDays || 0
                        ),

                    ageDays:
                        ageDays,

                    agingCategory:
                        calculateAgingCategory(
                            ageDays
                        ),

                    slaStatus:
                        calculateSLAStatus(pr),

                    riskLevel:
                        calculateRisk(pr)
                };
            });
        }
    );


    /*
     * =========================================================
     * DELAYED APPROVALS
     *
     * Only completed approvals are considered here.
     *
     * A PR is delayed when:
     *
     * Approval Cycle > SLA
     * =========================================================
     */

    this.on(
        'READ',
        DelayedApprovals,
        async () => {

            const prs =
                await cds.run(
                    SELECT.from(
                        dbPurchaseRequisitions
                    )
                );


            const departments =
                await cds.run(
                    SELECT.from(
                        dbDepartments
                    )
                );


            const departmentMap =
                new Map(
                    departments.map(
                        department => [
                            department.departmentCode,
                            department
                        ]
                    )
                );


            const result = [];


            for (const pr of prs) {

                /*
                 * Only approved PRs
                 */

                const isApproved =
                    pr.status === 'Approved' ||
                    pr.approvalStatus === 'Approved';


                if (!isApproved) {
                    continue;
                }


                /*
                 * Calculate approval cycle
                 */

                const approvalCycle =
                    calculateApprovalCycle(pr);


                if (approvalCycle === null) {
                    continue;
                }


                const sla =
                    Number(pr.slaDays || 0);


                /*
                 * Skip PRs without SLA
                 */

                if (sla <= 0) {
                    continue;
                }


                /*
                 * Calculate delay
                 */

                const delayDays =
                    Math.max(
                        0,
                        approvalCycle - sla
                    );


                /*
                 * Only delayed PRs
                 */

                if (delayDays <= 0) {
                    continue;
                }


                const department =
                    departmentMap.get(
                        pr.departmentCode
                    );


                const delayPercentage =
                    (
                        delayDays /
                        sla *
                        100
                    );


                result.push({

                    PRNumber:
                        pr.PRNumber,

                    PRItem:
                        pr.PRItem,

                    createdBy:
                        pr.createdBy,

                    createdDate:
                        pr.createdDate,

                    approvalDate:
                        pr.approvalDate,

                    departmentCode:
                        pr.departmentCode,

                    departmentName:
                        department
                            ? department.departmentName
                            : 'Unknown',

                    status:
                        pr.status,

                    slaDays:
                        sla,

                    approvalCycleDays:
                        approvalCycle,

                    delayDays:
                        delayDays,

                    delayPercentage:
                        Number(
                            delayPercentage.toFixed(2)
                        ),

                    delayStatus:
                        delayDays >= 5
                            ? 'SEVERELY_DELAYED'
                            : delayDays >= 3
                                ? 'HIGH_DELAY'
                                : 'DELAYED'
                });
            }


            /*
             * Sort:
             * highest delay first
             */

            result.sort(
                (a, b) =>
                    b.delayDays -
                    a.delayDays
            );


            return result;
        }
    );


    /*
     * =========================================================
     * DEPARTMENT BOTTLENECK
     * =========================================================
     */

    this.on(
        'READ',
        DepartmentBottlenecks,
        async () => {

            const prs =
                await cds.run(
                    SELECT.from(
                        dbPurchaseRequisitions
                    )
                );


            const departments =
                await cds.run(
                    SELECT.from(
                        dbDepartments
                    )
                );


            const result = [];


            for (const department of departments) {

                const departmentPRs =
                    prs.filter(
                        pr =>
                            pr.departmentCode ===
                            department.departmentCode
                    );


                const totalPRs =
                    departmentPRs.length;


                const pendingPRs =
                    departmentPRs.filter(
                        pr =>
                            pr.status === 'Pending'
                    ).length;


                const approvedPRs =
                    departmentPRs.filter(
                        pr =>
                            pr.status === 'Approved'
                    ).length;


                let delayedPRs = 0;

                let totalApprovalDays = 0;

                let approvalCount = 0;


                for (const pr of departmentPRs) {

                    const approvalCycle =
                        calculateApprovalCycle(pr);


                    /*
                     * Delayed approval
                     */

                    if (
                        (
                            pr.status === 'Approved' ||
                            pr.approvalStatus === 'Approved'
                        ) &&
                        approvalCycle !== null &&
                        Number(pr.slaDays) > 0 &&
                        approvalCycle >
                        Number(pr.slaDays)
                    ) {

                        delayedPRs++;
                    }


                    /*
                     * Average approval time
                     */

                    if (
                        approvalCycle !== null
                    ) {

                        totalApprovalDays +=
                            approvalCycle;

                        approvalCount++;
                    }
                }


                const averageApprovalDays =
                    approvalCount === 0
                        ? 0
                        :
                        totalApprovalDays /
                        approvalCount;


                const bottleneckPercentage =
                    totalPRs === 0
                        ? 0
                        :
                        (
                            delayedPRs /
                            totalPRs
                        ) * 100;


                /*
                 * Determine bottleneck level
                 */

                let bottleneckLevel =
                    'LOW';


                if (
                    bottleneckPercentage >= 40
                ) {

                    bottleneckLevel =
                        'CRITICAL';

                } else if (
                    bottleneckPercentage >= 25
                ) {

                    bottleneckLevel =
                        'HIGH';

                } else if (
                    bottleneckPercentage >= 10
                ) {

                    bottleneckLevel =
                        'MEDIUM';
                }


                result.push({

                    departmentCode:
                        department.departmentCode,

                    departmentName:
                        department.departmentName,

                    totalPRs:

                        totalPRs,

                    pendingPRs:

                        pendingPRs,

                    approvedPRs:

                        approvedPRs,

                    delayedPRs:

                        delayedPRs,

                    averageApprovalDays:

                        Number(
                            averageApprovalDays
                                .toFixed(2)
                        ),

                    bottleneckPercentage:

                        Number(
                            bottleneckPercentage
                                .toFixed(2)
                        ),

                    bottleneckLevel:
                        bottleneckLevel
                });
            }


            /*
             * Highest bottleneck first
             */

            result.sort(
                (a, b) =>
                    b.bottleneckPercentage -
                    a.bottleneckPercentage
            );


            return result;
        }
    );


    /*
     * =========================================================
     * DASHBOARD KPIs
     * =========================================================
     */

    this.on(
    'getDashboardKPIs',
    async () => {

        const prs = await cds.run(
            SELECT.from(dbPurchaseRequisitions)
        );

        const departments = await cds.run(
            SELECT.from(dbDepartments)
        );

        let totalPRs = prs.length;

        let pendingPRs = 0;

        let agingPRs = 0;

        let approvedPRs = 0;

        let delayedPRs = 0;

        let highRiskPRs = 0;

        let totalApprovalDays = 0;

        let approvalCount = 0;


        /*
         * =====================================================
         * PR LEVEL KPIs
         * =====================================================
         */

        for (const pr of prs) {

            const age =
                calculatePRAge(pr);

            const approvalCycle =
                calculateApprovalCycle(pr);

            const risk =
                calculateRisk(pr);


            /*
             * Pending PRs
             */

            const isPending =
                pr.status === 'Pending';


            if (isPending) {
                pendingPRs++;
            }


            /*
             * Aging PRs
             *
             * Based on your aging rules:
             *
             * 0 - 2   = NORMAL
             * 3 - 5   = WARNING
             * 6 - 7   = HIGH
             * 8+      = CRITICAL
             *
             * Therefore age > 2 is considered aging.
             */

            if (
                age !== null &&
                age > 2
            ) {
                agingPRs++;
            }


            /*
             * Approved PRs
             */

            const isApproved =
                pr.status === 'Approved' ||
                pr.approvalStatus === 'Approved';


            if (isApproved) {
                approvedPRs++;
            }


            /*
             * Delayed PRs
             *
             * Approval cycle > SLA
             */

            if (
                isApproved &&
                approvalCycle !== null &&
                Number(pr.slaDays) > 0 &&
                approvalCycle >
                Number(pr.slaDays)
            ) {
                delayedPRs++;
            }


            /*
             * High Risk PRs
             */

            if (risk === 'HIGH') {
                highRiskPRs++;
            }


            /*
             * Average approval time
             */

            if (approvalCycle !== null) {

                totalApprovalDays +=
                    approvalCycle;

                approvalCount++;
            }
        }


        /*
         * =====================================================
         * BOTTLENECK DEPARTMENTS
         * =====================================================
         */

        let bottleneckDepartments = 0;


        for (const department of departments) {

            const departmentPRs =
                prs.filter(
                    pr =>
                        pr.departmentCode ===
                        department.departmentCode
                );


            const totalDepartmentPRs =
                departmentPRs.length;


            if (totalDepartmentPRs === 0) {
                continue;
            }


            let delayedDepartmentPRs = 0;


            for (const pr of departmentPRs) {

                const isApproved =
                    pr.status === 'Approved' ||
                    pr.approvalStatus === 'Approved';


                const approvalCycle =
                    calculateApprovalCycle(pr);


                if (
                    isApproved &&
                    approvalCycle !== null &&
                    Number(pr.slaDays) > 0 &&
                    approvalCycle >
                    Number(pr.slaDays)
                ) {
                    delayedDepartmentPRs++;
                }
            }


            const bottleneckPercentage =
                (
                    delayedDepartmentPRs /
                    totalDepartmentPRs
                ) * 100;


            /*
             * HIGH or CRITICAL department
             */

            if (bottleneckPercentage >= 25) {
                bottleneckDepartments++;
            }
        }


        /*
         * =====================================================
         * AVERAGE APPROVAL DAYS
         * =====================================================
         */

        const averageApprovalDays =
            approvalCount === 0
                ? 0
                :
                totalApprovalDays /
                approvalCount;


        /*
         * =====================================================
         * RETURN DASHBOARD DATA
         * =====================================================
         */

        return {

            totalPRs:

                totalPRs,

            pendingPRs:

                pendingPRs,

            agingPRs:

                agingPRs,

            delayedPRs:

                delayedPRs,

            approvedPRs:

                approvedPRs,

            highRiskPRs:

                highRiskPRs,

            bottleneckDepartments:

                bottleneckDepartments,

            averageApprovalDays:

                Number(
                    averageApprovalDays.toFixed(2)
                )
        };
    }
);

});