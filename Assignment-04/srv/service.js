const cds = require("@sap/cds");

const {
    SELECT,
    UPDATE,
    INSERT
} = cds.ql;


module.exports = cds.service.impl(async function () {

    const {
        PurchaseRequisition,
        PurchaseOrder
    } = this.entities;


    // =========================================================
    // CONSTANTS
    // =========================================================

    const STATUS = {
        PENDING: "Pending",
        APPROVED: "Approved",
        REJECTED: "Rejected"
    };

    const RISK = {
        LOW: "LOW",
        MEDIUM: "MEDIUM",
        HIGH: "HIGH"
    };


    // =========================================================
    // UTILITY FUNCTIONS
    // =========================================================

    function startOfDay(date) {

        const d = new Date(date);

        d.setHours(
            0,
            0,
            0,
            0
        );

        return d;
    }


    function calculateDaysBetween(
        startDate,
        endDate
    ) {

        if (!startDate) {
            return 0;
        }

        const start =
            startOfDay(startDate);

        const end =
            startOfDay(
                endDate || new Date()
            );

        const difference =
            end.getTime() -
            start.getTime();

        return Math.max(
            0,
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            )
        );
    }


    function calculatePRAging(
        createdDate
    ) {

        return calculateDaysBetween(
            createdDate,
            new Date()
        );
    }


    function calculateApprovalCycle(
        createdDate,
        approvalDate
    ) {

        if (!createdDate) {
            return 0;
        }

        return calculateDaysBetween(
            createdDate,
            approvalDate || new Date()
        );
    }


    function calculateSLAStatus(
        aging,
        sla
    ) {

        const iAging =
            Number(aging || 0);

        const iSLA =
            Number(sla || 0);


        if (!iSLA) {
            return "WITHIN_SLA";
        }


        if (iAging > iSLA) {
            return "BREACHED";
        }


        if (
            iAging === iSLA ||
            iAging === iSLA - 1
        ) {
            return "AT_RISK";
        }


        return "WITHIN_SLA";
    }


    // =========================================================
    // AI-STYLE RISK SCORE
    // =========================================================

    function calculateRiskScore(
        pr
    ) {

        let score = 0;


        const aging =
            Number(
                pr.PRAging || 0
            );

        const sla =
            Number(
                pr.SLAInDays || 0
            );


        // -----------------------------------------------------
        // AGING SCORE
        // -----------------------------------------------------

        if (
            sla > 0 &&
            aging > sla
        ) {

            score += 50;

        } else if (
            sla > 0 &&
            aging === sla - 1
        ) {

            score += 35;

        } else if (
            sla > 0 &&
            aging === sla - 2
        ) {

            score += 20;

        } else {

            score += 5;
        }


        // -----------------------------------------------------
        // PRIORITY SCORE
        // -----------------------------------------------------

        switch (
            String(
                pr.Priority || ""
            ).toUpperCase()
        ) {

            case "CRITICAL":
                score += 25;
                break;

            case "HIGH":
                score += 18;
                break;

            case "MEDIUM":
                score += 10;
                break;

            case "LOW":
                score += 5;
                break;

            default:
                score += 5;
        }


        // -----------------------------------------------------
        // PENDING SCORE
        // -----------------------------------------------------

        if (
            String(
                pr.Status || ""
            ).toUpperCase() === "PENDING"
        ) {

            score += 15;
        }


        // -----------------------------------------------------
        // EXPECTED APPROVAL DATE
        // -----------------------------------------------------

        if (
            pr.ExpectedApprovalDate
        ) {

            const today =
                startOfDay(
                    new Date()
                );

            const expected =
                startOfDay(
                    pr.ExpectedApprovalDate
                );

            const daysRemaining =
                Math.floor(
                    (
                        expected.getTime() -
                        today.getTime()
                    ) /
                    (1000 * 60 * 60 * 24)
                );


            if (daysRemaining < 0) {

                score += 20;

            } else if (
                daysRemaining === 1
            ) {

                score += 15;

            } else if (
                daysRemaining === 2
            ) {

                score += 8;
            }
        }


        score =
            Math.min(
                100,
                Math.max(
                    0,
                    score
                )
            );


        let riskLevel;
        let riskCategory;


        if (score >= 70) {

            riskLevel =
                RISK.HIGH;

            riskCategory =
                "Likely SLA Breach";

        } else if (score >= 40) {

            riskLevel =
                RISK.MEDIUM;

            riskCategory =
                "At Risk";

        } else {

            riskLevel =
                RISK.LOW;

            riskCategory =
                "Within SLA";
        }


        return {
            riskScore: score,
            riskLevel,
            riskCategory
        };
    }


    // =========================================================
    // ENRICH PR RECORD
    // =========================================================

    function enrichPR(
        pr
    ) {

        if (!pr) {
            return pr;
        }


        // -----------------------------------------------------
        // PR AGING
        // -----------------------------------------------------

        pr.PRAging =
            calculatePRAging(
                pr.CreatedDate
            );


        // -----------------------------------------------------
        // SLA STATUS
        // -----------------------------------------------------

        pr.SLAStatus =
            calculateSLAStatus(
                pr.PRAging,
                pr.SLAInDays
            );


        // -----------------------------------------------------
        // APPROVAL CYCLE
        // -----------------------------------------------------

        pr.ApprovalCycleTime =
            calculateApprovalCycle(
                pr.CreatedDate,
                pr.ApprovalDate
            );


        // -----------------------------------------------------
        // DELAY
        // -----------------------------------------------------

        const approvalCycle =
            Number(
                pr.ApprovalCycleTime || 0
            );

        const sla =
            Number(
                pr.SLAInDays || 0
            );


        pr.DelayDays =
            Math.max(
                0,
                approvalCycle - sla
            );


        // -----------------------------------------------------
        // DELAY %
        // -----------------------------------------------------

        if (sla > 0) {

            pr.DelayPercentage =
                Number(
                    (
                        pr.DelayDays /
                        sla *
                        100
                    ).toFixed(2)
                );

        } else {

            pr.DelayPercentage = 0;
        }


        // -----------------------------------------------------
        // EXPECTED APPROVAL DELAY
        // -----------------------------------------------------

        if (
            pr.ExpectedApprovalDate
        ) {

            const expected =
                startOfDay(
                    pr.ExpectedApprovalDate
                );

            const today =
                startOfDay(
                    new Date()
                );


            if (
                !pr.ApprovalDate &&
                today > expected
            ) {

                pr.DelayDays =
                    Math.max(
                        pr.DelayDays,
                        calculateDaysBetween(
                            expected,
                            today
                        )
                    );

            } else if (
                pr.ApprovalDate
            ) {

                const actual =
                    startOfDay(
                        pr.ApprovalDate
                    );


                if (actual > expected) {

                    const expectedDelay =
                        calculateDaysBetween(
                            expected,
                            actual
                        );

                    pr.DelayDays =
                        Math.max(
                            pr.DelayDays,
                            expectedDelay
                        );
                }
            }


            if (sla > 0) {

                pr.DelayPercentage =
                    Number(
                        (
                            pr.DelayDays /
                            sla *
                            100
                        ).toFixed(2)
                    );
            }
        }


        // -----------------------------------------------------
        // AI RISK
        // -----------------------------------------------------

        const risk =
            calculateRiskScore(
                pr
            );


        pr.RiskScore =
            risk.riskScore;

        pr.RiskLevel =
            risk.riskLevel;

        pr.RiskCategory =
            risk.riskCategory;


        return pr;
    }


    // =========================================================
    // READ PURCHASE REQUISITION
    // =========================================================

    this.after(
        "READ",
        "PurchaseRequisition",
        async function (results) {

            if (!results) {
                return;
            }


            const records =
                Array.isArray(results)
                    ? results
                    : [results];


            records.forEach(
                function (pr) {

                    enrichPR(pr);

                }
            );
        }
    );


    // =========================================================
    // APPROVE PR
    // =========================================================

    this.on(
        "approve",
        "PurchaseRequisition",
        async function (req) {

            const tx =
                cds.tx(req);


            const id =
                req.params &&
                req.params[0];


            if (!id) {

                return req.error(
                    400,
                    "Purchase Requisition ID is required."
                );
            }


            const pr =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            if (!pr) {

                return req.error(
                    404,
                    "Purchase Requisition not found."
                );
            }


            if (
                String(
                    pr.Status || ""
                ).toUpperCase() ===
                "APPROVED"
            ) {

                return req.error(
                    400,
                    "Purchase Requisition is already approved."
                );
            }


            const approvalDate =
                new Date();


            await tx.run(
                UPDATE(
                    PurchaseRequisition
                )
                .set({
                    Status:
                        STATUS.APPROVED,

                    ApprovalDate:
                        approvalDate
                })
                .where({
                    ID: id
                })
            );


            const updated =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            enrichPR(
                updated
            );


            return updated;
        }
    );


    // =========================================================
    // REJECT PR
    // =========================================================

    this.on(
        "reject",
        "PurchaseRequisition",
        async function (req) {

            const tx =
                cds.tx(req);


            const id =
                req.params &&
                req.params[0];


            if (!id) {

                return req.error(
                    400,
                    "Purchase Requisition ID is required."
                );
            }


            const pr =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            if (!pr) {

                return req.error(
                    404,
                    "Purchase Requisition not found."
                );
            }


            const reason =
                req.data &&
                req.data.reason;


            await tx.run(
                UPDATE(
                    PurchaseRequisition
                )
                .set({
                    Status:
                        STATUS.REJECTED
                })
                .where({
                    ID: id
                })
            );


            const updated =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            enrichPR(
                updated
            );


            /*
             * Reason is accepted by the action.
             *
             * If a RejectionReason field exists in your
             * schema, it can also be persisted here.
             */
            if (reason) {
                console.log(
                    `PR ${updated.PRNumber} rejected. Reason: ${reason}`
                );
            }


            return updated;
        }
    );


    // =========================================================
    // MARK AS URGENT
    // =========================================================

    this.on(
        "markAsUrgent",
        "PurchaseRequisition",
        async function (req) {

            const tx =
                cds.tx(req);


            const id =
                req.params &&
                req.params[0];


            if (!id) {

                return req.error(
                    400,
                    "Purchase Requisition ID is required."
                );
            }


            const pr =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            if (!pr) {

                return req.error(
                    404,
                    "Purchase Requisition not found."
                );
            }


            await tx.run(
                UPDATE(
                    PurchaseRequisition
                )
                .set({
                    Priority:
                        "Critical"
                })
                .where({
                    ID: id
                })
            );


            const updated =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            enrichPR(
                updated
            );


            return updated;
        }
    );


    // =========================================================
    // CREATE PURCHASE ORDER
    // =========================================================

    this.on(
        "createPurchaseOrder",
        "PurchaseRequisition",
        async function (req) {

            const tx =
                cds.tx(req);


            const id =
                req.params &&
                req.params[0];


            if (!id) {

                return req.error(
                    400,
                    "Purchase Requisition ID is required."
                );
            }


            const pr =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            if (!pr) {

                return req.error(
                    404,
                    "Purchase Requisition not found."
                );
            }


            if (
                String(
                    pr.Status || ""
                ).toUpperCase() !==
                "APPROVED"
            ) {

                return req.error(
                    400,
                    "Purchase Order can only be created for an approved Purchase Requisition."
                );
            }


            const vendor =
                req.data.vendor ||
                pr.Vendor ||
                "Default Vendor";


            const totalAmount =
                Number(
                    req.data.totalAmount ||
                    pr.EstimatedCost ||
                    0
                );


            /*
             * Generate a simple PO number.
             */
            const poNumber =
                "PO" +
                Date.now()
                    .toString()
                    .slice(-8);


            /*
             * Create Purchase Order.
             *
             * Adjust fields here if your schema has
             * additional mandatory PurchaseOrder fields.
             */
            await tx.run(
                INSERT.into(
                    PurchaseOrder
                )
                .entries({
                    PONumber:
                        poNumber,

                    PRNumber:
                        pr.PRNumber,

                    Vendor:
                        vendor,

                    TotalAmount:
                        totalAmount,

                    CreatedDate:
                        new Date(),

                    Status:
                        "Created"
                })
            );


            /*
             * Update PR with PO information.
             */
            await tx.run(
                UPDATE(
                    PurchaseRequisition
                )
                .set({
                    PONumber:
                        poNumber
                })
                .where({
                    ID: id
                })
            );


            const updated =
                await tx.run(
                    SELECT.one
                        .from(
                            PurchaseRequisition
                        )
                        .where({
                            ID: id
                        })
                );


            enrichPR(
                updated
            );


            return updated;
        }
    );


    // =========================================================
    // REFRESH DASHBOARD
    // =========================================================

    this.on(
        "refreshDashboard",
        async function () {

            return "Dashboard data refreshed successfully.";
        }
    );


    // =========================================================
    // KPI SUMMARY
    // =========================================================

    this.on(
        "getKPISummary",
        async function (req) {

            const db =
                await cds.connect.to("db");


            const aPRs =
                await db.run(
                    SELECT.from(
                        PurchaseRequisition
                    )
                );


            const aEnrichedPRs =
                aPRs.map(
                    function (pr) {

                        return enrichPR({
                            ...pr
                        });

                    }
                );


            const total =
                aEnrichedPRs.length;


            const pending =
                aEnrichedPRs.filter(
                    function (pr) {

                        return String(
                            pr.Status || ""
                        ).toUpperCase() ===
                            "PENDING";

                    }
                ).length;


            const approved =
                aEnrichedPRs.filter(
                    function (pr) {

                        return String(
                            pr.Status || ""
                        ).toUpperCase() ===
                            "APPROVED";

                    }
                ).length;


            const rejected =
                aEnrichedPRs.filter(
                    function (pr) {

                        return String(
                            pr.Status || ""
                        ).toUpperCase() ===
                            "REJECTED";

                    }
                ).length;


            const delayed =
                aEnrichedPRs.filter(
                    function (pr) {

                        return Number(
                            pr.DelayDays || 0
                        ) > 0;

                    }
                ).length;


            const highRisk =
                aEnrichedPRs.filter(
                    function (pr) {

                        return pr.RiskLevel ===
                            RISK.HIGH;

                    }
                ).length;


            const totalApprovalTime =
                aEnrichedPRs.reduce(
                    function (
                        totalTime,
                        pr
                    ) {

                        if (
                            String(
                                pr.Status || ""
                            ).toUpperCase() ===
                            "APPROVED"
                        ) {

                            return (
                                totalTime +
                                Number(
                                    pr.ApprovalCycleTime ||
                                    0
                                )
                            );
                        }


                        return totalTime;

                    },
                    0
                );


            const approvalCount =
                aEnrichedPRs.filter(
                    function (pr) {

                        return (
                            String(
                                pr.Status || ""
                            ).toUpperCase() ===
                            "APPROVED"
                        );

                    }
                ).length;


            const totalAging =
                aEnrichedPRs.reduce(
                    function (
                        totalAge,
                        pr
                    ) {

                        return (
                            totalAge +
                            Number(
                                pr.PRAging || 0
                            )
                        );

                    },
                    0
                );


            return {

                TotalPRs:
                    total,

                PendingPRs:
                    pending,

                ApprovedPRs:
                    approved,

                RejectedPRs:
                    rejected,

                DelayedPRs:
                    delayed,

                HighRiskPRs:
                    highRisk,

                AverageApprovalTime:
                    approvalCount
                        ? Number(
                            (
                                totalApprovalTime /
                                approvalCount
                            ).toFixed(2)
                        )
                        : 0,

                AveragePRAging:
                    total
                        ? Number(
                            (
                                totalAging /
                                total
                            ).toFixed(2)
                        )
                        : 0
            };
        }
    );


    // =========================================================
    // ML-STYLE PREDICTIONS
    // =========================================================

    this.on(
        "getMLPredictions",
        async function () {

            const db =
                await cds.connect.to("db");


            const aPRs =
                await db.run(
                    SELECT.from(
                        PurchaseRequisition
                    )
                );


            return aPRs.map(
                function (pr) {

                    const enriched =
                        enrichPR({
                            ...pr
                        });


                    return {

                        PRNumber:
                            enriched.PRNumber,

                        riskScore:
                            enriched.RiskScore,

                        riskCategory:
                            enriched.RiskCategory,

                        riskLevel:
                            enriched.RiskLevel,

                        method:
                            "Transparent Rule-Based SLA Risk Model"
                    };
                }
            );
        }
    );


    // =========================================================
    // HIGH-RISK PRs
    // =========================================================

    this.on(
        "getHighRiskPRs",
        async function (req) {

            const threshold =
                Number(
                    req.data.threshold || 70
                );


            const db =
                await cds.connect.to("db");


            const aPRs =
                await db.run(
                    SELECT.from(
                        PurchaseRequisition
                    )
                );


            return aPRs
                .map(
                    function (pr) {

                        const enriched =
                            enrichPR({
                                ...pr
                            });


                        return {

                            PRNumber:
                                enriched.PRNumber,

                            riskScore:
                                enriched.RiskScore,

                            riskCategory:
                                enriched.RiskCategory,

                            riskLevel:
                                enriched.RiskLevel,

                            method:
                                "Transparent Rule-Based SLA Risk Model"
                        };
                    }
                )
                .filter(
                    function (prediction) {

                        return (
                            prediction.riskScore >=
                            threshold
                        );

                    }
                );
        }
    );

});