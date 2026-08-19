sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return Controller.extend("pr.tracker.project1.controller.Home", {

        /**
         * Controller initialization
         */
        onInit: function () {
            this.loadDashboardData();
        },

        /**
         * Load dashboard KPI data
         *
         * Uses the default OData V4 model configured
         * in manifest.json.
         */
        loadDashboardData: function () {

            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel();

            if (!oModel) {
                MessageBox.error(
                    "OData model could not be found. Please check manifest.json."
                );
                return;
            }

            var oDashboardModel = new JSONModel({
                TotalPRs: 0,
                AgingPRs: 0,
                DelayedPRs: 0,
                Bottlenecks: 0,
                PendingPRs: 0,
                ApprovedPRs: 0,
                HighRiskPRs: 0,
                AverageApprovalTime: 0,
                loading: true
            });

            oView.setModel(oDashboardModel, "dashboard");

            /*
             * OData V4 list binding.
             *
             * The entity name should match the entity exposed
             * by your existing CAP service.
             */
            try {

                var oBinding = oModel.bindList("/PurchaseRequisition");

                oBinding.requestContexts(0, 1000)
                    .then(function (aContexts) {

                        var aPRs = aContexts.map(function (oContext) {
                            return oContext.getObject();
                        });

                        var oData = this._calculateKPIs(aPRs);

                        oData.loading = false;

                        oDashboardModel.setData(oData);

                    }.bind(this))
                    .catch(function (oError) {

                        console.error(
                            "Error loading Purchase Requisitions:",
                            oError
                        );

                        oDashboardModel.setProperty(
                            "/loading",
                            false
                        );

                        MessageBox.error(
                            "Unable to load Purchase Requisition data."
                        );

                    });

            } catch (oError) {

                console.error(
                    "Dashboard data loading error:",
                    oError
                );

                oDashboardModel.setProperty(
                    "/loading",
                    false
                );
            }
        },

        /**
         * Calculate dashboard KPIs
         */
        _calculateKPIs: function (aPRs) {

            var iTotal = aPRs.length;

            var iAging = 0;
            var iDelayed = 0;
            var iPending = 0;
            var iApproved = 0;
            var iHighRisk = 0;

            var iTotalApprovalDays = 0;
            var iApprovedCount = 0;

            var oDepartments = {};

            var oToday = new Date();

            aPRs.forEach(function (oPR) {

                var sStatus = String(
                    oPR.Status || ""
                ).toLowerCase();

                /*
                 * -----------------------------------------
                 * PR AGING
                 * -----------------------------------------
                 */
                var iAgingDays = 0;

                if (oPR.CreatedDate) {

                    var oCreatedDate = new Date(
                        oPR.CreatedDate
                    );

                    if (!isNaN(oCreatedDate.getTime())) {

                        iAgingDays = Math.floor(
                            (
                                oToday.getTime() -
                                oCreatedDate.getTime()
                            ) /
                            (1000 * 60 * 60 * 24)
                        );

                        if (iAgingDays < 0) {
                            iAgingDays = 0;
                        }
                    }
                }

                var iSLA = Number(
                    oPR.SLAInDays ||
                    oPR.SLA ||
                    0
                );

                /*
                 * Aging PR
                 */
                if (
                    iSLA > 0 &&
                    iAgingDays >= iSLA
                ) {
                    iAging++;
                }

                /*
                 * -----------------------------------------
                 * STATUS
                 * -----------------------------------------
                 */

                if (
                    sStatus === "pending" ||
                    sStatus === "in progress" ||
                    sStatus === "submitted"
                ) {
                    iPending++;
                }

                if (sStatus === "approved") {
                    iApproved++;
                }

                /*
                 * -----------------------------------------
                 * APPROVAL CYCLE
                 * -----------------------------------------
                 */

                if (
                    oPR.CreatedDate &&
                    oPR.ApprovalDate
                ) {

                    var oCreated =
                        new Date(oPR.CreatedDate);

                    var oApproved =
                        new Date(oPR.ApprovalDate);

                    if (
                        !isNaN(oCreated.getTime()) &&
                        !isNaN(oApproved.getTime())
                    ) {

                        var iApprovalDays =
                            Math.max(
                                0,
                                Math.floor(
                                    (
                                        oApproved.getTime() -
                                        oCreated.getTime()
                                    ) /
                                    (1000 * 60 * 60 * 24)
                                )
                            );

                        iTotalApprovalDays +=
                            iApprovalDays;

                        iApprovedCount++;
                    }
                }

                /*
                 * -----------------------------------------
                 * DELAYED APPROVAL
                 * -----------------------------------------
                 */

                var bDelayed = false;

                if (
                    oPR.ApprovalDate &&
                    oPR.ExpectedApprovalDate
                ) {

                    var oApprovalDate =
                        new Date(oPR.ApprovalDate);

                    var oExpectedDate =
                        new Date(oPR.ExpectedApprovalDate);

                    if (
                        oApprovalDate >
                        oExpectedDate
                    ) {
                        bDelayed = true;
                    }

                } else if (
                    !oPR.ApprovalDate &&
                    oPR.ExpectedApprovalDate
                ) {

                    var oExpected =
                        new Date(
                            oPR.ExpectedApprovalDate
                        );

                    if (
                        oToday >
                        oExpected
                    ) {
                        bDelayed = true;
                    }
                }

                if (bDelayed) {
                    iDelayed++;
                }

                /*
                 * -----------------------------------------
                 * AI-STYLE RISK SCORE
                 * -----------------------------------------
                 *
                 * Transparent rule-based prediction.
                 *
                 * This follows the project's AI enhancement
                 * requirement without requiring an external
                 * AI API.
                 */

                var iRiskScore = 0;

                /*
                 * Aging score
                 */
                if (
                    iSLA > 0 &&
                    iAgingDays > iSLA
                ) {
                    iRiskScore += 50;

                } else if (
                    iSLA > 0 &&
                    iSLA - iAgingDays <= 1
                ) {
                    iRiskScore += 35;

                } else if (
                    iSLA > 0 &&
                    iSLA - iAgingDays <= 2
                ) {
                    iRiskScore += 20;

                } else {
                    iRiskScore += 5;
                }

                /*
                 * Priority score
                 */
                var sPriority = String(
                    oPR.Priority || ""
                ).toLowerCase();

                if (sPriority === "critical") {
                    iRiskScore += 25;

                } else if (sPriority === "high") {
                    iRiskScore += 18;

                } else if (sPriority === "medium") {
                    iRiskScore += 10;

                } else {
                    iRiskScore += 5;
                }

                /*
                 * Pending score
                 */
                if (
                    sStatus === "pending" ||
                    sStatus === "in progress" ||
                    sStatus === "submitted"
                ) {
                    iRiskScore += 15;
                }

                /*
                 * Expected approval score
                 */
                if (oPR.ExpectedApprovalDate) {

                    var oExpectedApproval =
                        new Date(
                            oPR.ExpectedApprovalDate
                        );

                    if (
                        oToday >
                        oExpectedApproval
                    ) {

                        iRiskScore += 20;

                    } else {

                        var iDaysRemaining =
                            Math.ceil(
                                (
                                    oExpectedApproval.getTime() -
                                    oToday.getTime()
                                ) /
                                (1000 * 60 * 60 * 24)
                            );

                        if (
                            iDaysRemaining <= 1
                        ) {
                            iRiskScore += 15;

                        } else if (
                            iDaysRemaining <= 2
                        ) {
                            iRiskScore += 8;
                        }
                    }
                }

                /*
                 * Maximum score = 100
                 */
                iRiskScore = Math.min(
                    iRiskScore,
                    100
                );

                /*
                 * High risk PR
                 */
                if (iRiskScore >= 70) {
                    iHighRisk++;
                }

                /*
                 * -----------------------------------------
                 * DEPARTMENT DATA
                 * -----------------------------------------
                 */

                var sDepartment =
                    oPR.Department ||
                    oPR.PurchasingGroup ||
                    oPR.DepartmentName ||
                    "Unknown";

                if (!oDepartments[sDepartment]) {

                    oDepartments[sDepartment] = {
                        total: 0,
                        delayed: 0,
                        pending: 0,
                        highRisk: 0
                    };
                }

                oDepartments[sDepartment].total++;

                if (bDelayed) {
                    oDepartments[sDepartment].delayed++;
                }

                if (
                    sStatus === "pending" ||
                    sStatus === "in progress" ||
                    sStatus === "submitted"
                ) {
                    oDepartments[sDepartment].pending++;
                }

                if (iRiskScore >= 70) {
                    oDepartments[sDepartment].highRisk++;
                }
            });

            /*
             * -----------------------------------------
             * BOTTLENECK DEPARTMENTS
             * -----------------------------------------
             */

            var iBottlenecks = 0;

            Object.keys(oDepartments).forEach(
                function (sDepartment) {

                    var oDepartment =
                        oDepartments[sDepartment];

                    if (
                        oDepartment.delayed > 0 ||
                        oDepartment.highRisk > 0
                    ) {
                        iBottlenecks++;
                    }
                }
            );

            /*
             * -----------------------------------------
             * AVERAGE APPROVAL TIME
             * -----------------------------------------
             */

            var iAverageApproval = 0;

            if (iApprovedCount > 0) {

                iAverageApproval =
                    (
                        iTotalApprovalDays /
                        iApprovedCount
                    ).toFixed(1);
            }

            return {

                TotalPRs: iTotal,

                AgingPRs: iAging,

                DelayedPRs: iDelayed,

                Bottlenecks: iBottlenecks,

                PendingPRs: iPending,

                ApprovedPRs: iApproved,

                HighRiskPRs: iHighRisk,

                AverageApprovalTime:
                    iAverageApproval,

                departments:
                    oDepartments,

                lastUpdated:
                    new Date()
            };
        },

        /**
         * Refresh dashboard
         */
        onRefresh: function () {

            MessageToast.show(
                "Refreshing dashboard..."
            );

            this.loadDashboardData();
        },

        /**
         * Navigate to PR Aging page
         */
        onNavigateAging: function () {

            var oRouter =
                this.getOwnerComponent()
                    .getRouter();

            if (oRouter) {

                oRouter.navTo(
                    "Aging"
                );
            }
        },

        /**
         * Navigate to Delayed Approvals page
         */
        onNavigateDelayed: function () {

            var oRouter =
                this.getOwnerComponent()
                    .getRouter();

            if (oRouter) {

                oRouter.navTo(
                    "Delayed"
                );
            }
        },

        /**
         * Navigate to Department Bottlenecks page
         */
        onNavigateBottleneck: function () {

            var oRouter =
                this.getOwnerComponent()
                    .getRouter();

            if (oRouter) {

                oRouter.navTo(
                    "Bottleneck"
                );
            }
        },

        /**
         * Open High Risk PRs
         *
         * This function fixes the current error:
         *
         * ".onOpenHighRisk is not a function"
         */
        onOpenHighRisk: function () {

            var oRouter =
                this.getOwnerComponent()
                    .getRouter();

            if (oRouter) {

                oRouter.navTo(
                    "Aging",
                    {
                        filter: "HIGH"
                    }
                );
            }
        },

        /**
         * Navigate back to Home
         */
        onNavigateHome: function () {

            var oRouter =
                this.getOwnerComponent()
                    .getRouter();

            if (oRouter) {

                oRouter.navTo(
                    "Home"
                );
            }
        }

    });
});