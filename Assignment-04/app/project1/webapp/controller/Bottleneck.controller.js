sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter"
], function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    JSONModel,
    MessageToast,
    MessageBox,
    formatter
) {
    "use strict";

    return Controller.extend(
        "pr.tracker.project1.controller.Bottleneck",
        {

            formatter: formatter,


            /**
             * =====================================================
             * INIT
             * =====================================================
             */
            onInit: function () {

                this._oRouter =
                    this.getOwnerComponent()
                        .getRouter();

                this._sSearchQuery = "";

                this._bSortDescending = true;

                /*
                 * Local JSON model is used for the department
                 * analytics because the backend calculates
                 * delayed/high-risk values dynamically.
                 */
                this._oBottleneckModel =
                    new JSONModel({
                        departments: [],
                        totalDepartments: 0,
                        bottleneckDepartments: 0,
                        highRiskDepartments: 0,
                        totalDelayedPRs: 0
                    });


                this.getView().setModel(
                    this._oBottleneckModel,
                    "bottleneck"
                );


                /*
                 * Load when route is opened.
                 */
                this._oRouter
                    .getRoute("Bottleneck")
                    .attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );
            },


            /**
             * =====================================================
             * ROUTE MATCHED
             * =====================================================
             */
            _onRouteMatched: function () {

                this.loadDepartmentData();
            },


            /**
             * =====================================================
             * LOAD DEPARTMENT DATA
             * =====================================================
             */
            loadDepartmentData: function () {

                var oModel =
                    this.getOwnerComponent()
                        .getModel();

                var oOperation =
                    oModel.bindList(
                        "/DepartmentAnalytics"
                    );


                oOperation.requestContexts()
                    .then(
                        function (aContexts) {

                            var aDepartments =
                                aContexts.map(
                                    function (oContext) {

                                        return oContext.getObject();

                                    }
                                );


                            /*
                             * Calculate bottleneck level
                             * for every department.
                             */
                            aDepartments.forEach(
                                function (oDepartment) {

                                    oDepartment.BottleneckLevel =
                                        this._calculateBottleneckLevel(
                                            oDepartment
                                        );

                                }.bind(this)
                            );


                            /*
                             * Calculate summary.
                             */
                            var iBottleneckDepartments =
                                aDepartments.filter(
                                    function (
                                        oDepartment
                                    ) {

                                        return (
                                            oDepartment.BottleneckLevel ===
                                            "HIGH"
                                        );

                                    }
                                ).length;


                            var iHighRiskDepartments =
                                aDepartments.filter(
                                    function (
                                        oDepartment
                                    ) {

                                        return Number(
                                            oDepartment.HighRiskPRs || 0
                                        ) > 0;

                                    }
                                ).length;


                            var iDelayedPRs =
                                aDepartments.reduce(
                                    function (
                                        iTotal,
                                        oDepartment
                                    ) {

                                        return (
                                            iTotal +
                                            Number(
                                                oDepartment.DelayedPRs || 0
                                            )
                                        );

                                    },
                                    0
                                );


                            /*
                             * Update local model.
                             */
                            this._oBottleneckModel.setProperty(
                                "/departments",
                                aDepartments
                            );


                            this._oBottleneckModel.setProperty(
                                "/totalDepartments",
                                aDepartments.length
                            );


                            this._oBottleneckModel.setProperty(
                                "/bottleneckDepartments",
                                iBottleneckDepartments
                            );


                            this._oBottleneckModel.setProperty(
                                "/highRiskDepartments",
                                iHighRiskDepartments
                            );


                            this._oBottleneckModel.setProperty(
                                "/totalDelayedPRs",
                                iDelayedPRs
                            );


                        }.bind(this)
                    )
                    .catch(
                        function (oError) {

                            console.error(
                                "Department analytics error:",
                                oError
                            );


                            MessageBox.error(
                                oError.message ||
                                "Unable to load department bottleneck data."
                            );

                        }.bind(this)
                    );
            },


            /**
             * =====================================================
             * CALCULATE BOTTLENECK LEVEL
             * =====================================================
             */
            _calculateBottleneckLevel:
                function (oDepartment) {

                    var iDelayed =
                        Number(
                            oDepartment.DelayedPRs || 0
                        );


                    var iHighRisk =
                        Number(
                            oDepartment.HighRiskPRs || 0
                        );


                    var iPending =
                        Number(
                            oDepartment.PendingPRs || 0
                        );


                    /*
                     * HIGH:
                     *
                     * 3+ delayed PRs
                     * OR
                     * 3+ high-risk PRs
                     * OR
                     * 2+ delayed AND 2+ high-risk
                     */
                    if (
                        iDelayed >= 3 ||
                        iHighRisk >= 3 ||
                        (
                            iDelayed >= 2 &&
                            iHighRisk >= 2
                        )
                    ) {

                        return "HIGH";
                    }


                    /*
                     * MEDIUM:
                     *
                     * At least one delayed/high-risk PR
                     * OR several pending PRs.
                     */
                    if (
                        iDelayed > 0 ||
                        iHighRisk > 0 ||
                        iPending >= 3
                    ) {

                        return "MEDIUM";
                    }


                    return "LOW";
                },


            /**
             * =====================================================
             * SEARCH
             * =====================================================
             */
            onSearch: function (oEvent) {

                var sQuery =
                    oEvent.getParameter(
                        "query"
                    );


                /*
                 * liveChange uses newValue.
                 */
                if (
                    sQuery === undefined ||
                    sQuery === null
                ) {

                    sQuery =
                        oEvent.getParameter(
                            "newValue"
                        );
                }


                this._sSearchQuery =
                    String(
                        sQuery || ""
                    ).trim()
                        .toLowerCase();


                this._applyFilters();
            },


            /**
             * =====================================================
             * FILTER DEPARTMENTS
             * =====================================================
             */
            onFilter: function (oEvent) {

                var sKey =
                    oEvent.getParameter(
                        "selectedKey"
                    );


                var aDepartments =
                    this._oBottleneckModel.getProperty(
                        "/departments"
                    ) || [];


                /*
                 * If ALL selected, reset to complete list.
                 */
                if (
                    !sKey ||
                    sKey === "ALL"
                ) {

                    this._oBottleneckModel.setProperty(
                        "/filteredDepartments",
                        aDepartments
                    );

                    return;
                }


                var aFiltered =
                    aDepartments.filter(
                        function (
                            oDepartment
                        ) {

                            return (
                                oDepartment.BottleneckLevel ===
                                sKey
                            );

                        }
                    );


                this._oBottleneckModel.setProperty(
                    "/filteredDepartments",
                    aFiltered
                );
            },


            /**
             * =====================================================
             * APPLY SEARCH
             * =====================================================
             */
            _applyFilters: function () {

                var aDepartments =
                    this._oBottleneckModel.getProperty(
                        "/departments"
                    ) || [];


                if (!this._sSearchQuery) {

                    this._oBottleneckModel.setProperty(
                        "/filteredDepartments",
                        aDepartments
                    );

                    return;
                }


                var sQuery =
                    this._sSearchQuery;


                var aFiltered =
                    aDepartments.filter(
                        function (
                            oDepartment
                        ) {

                            var sDepartment =
                                String(
                                    oDepartment.Department ||
                                    ""
                                ).toLowerCase();


                            return sDepartment.indexOf(
                                sQuery
                            ) !== -1;

                        }
                    );


                this._oBottleneckModel.setProperty(
                    "/filteredDepartments",
                    aFiltered
                );
            },


            /**
             * =====================================================
             * SORT BY DELAYED PRs
             * =====================================================
             */
            onSort: function () {

                var aDepartments =
                    this._oBottleneckModel.getProperty(
                        "/filteredDepartments"
                    );


                if (!aDepartments) {

                    aDepartments =
                        this._oBottleneckModel.getProperty(
                            "/departments"
                        ) || [];
                }


                this._bSortDescending =
                    !this._bSortDescending;


                aDepartments.sort(
                    function (
                        oA,
                        oB
                    ) {

                        var iA =
                            Number(
                                oA.DelayedPRs || 0
                            );


                        var iB =
                            Number(
                                oB.DelayedPRs || 0
                            );


                        return this._bSortDescending
                            ? iB - iA
                            : iA - iB;

                    }.bind(this)
                );


                this._oBottleneckModel.setProperty(
                    "/filteredDepartments",
                    aDepartments
                );
            },


            /**
             * =====================================================
             * SORT BY HIGH RISK
             * =====================================================
             */
            onSortRisk: function () {

                var aDepartments =
                    this._oBottleneckModel.getProperty(
                        "/filteredDepartments"
                    );


                if (!aDepartments) {

                    aDepartments =
                        this._oBottleneckModel.getProperty(
                            "/departments"
                        ) || [];
                }


                this._bRiskSortDescending =
                    !this._bRiskSortDescending;


                aDepartments.sort(
                    function (
                        oA,
                        oB
                    ) {

                        var iA =
                            Number(
                                oA.HighRiskPRs || 0
                            );


                        var iB =
                            Number(
                                oB.HighRiskPRs || 0
                            );


                        return this._bRiskSortDescending
                            ? iB - iA
                            : iA - iB;

                    }.bind(this)
                );


                this._oBottleneckModel.setProperty(
                    "/filteredDepartments",
                    aDepartments
                );
            },


            /**
             * =====================================================
             * REFRESH
             * =====================================================
             */
            onRefresh: function () {

                this.loadDepartmentData();

                MessageToast.show(
                    "Department bottleneck data refreshed."
                );
            },


            /**
             * =====================================================
             * ROW PRESS
             * =====================================================
             */
            onRowPress: function (oEvent) {

                var oContext =
                    oEvent.getParameter(
                        "listItem"
                    ).getBindingContext(
                        "bottleneck"
                    );


                if (!oContext) {
                    return;
                }


                var oDepartment =
                    oContext.getObject();


                MessageBox.information(
                    "Department: " +
                    (
                        oDepartment.Department ||
                        "-"
                    ) +

                    "\n\nTotal PRs: " +
                    (
                        oDepartment.TotalPRs ||
                        0
                    ) +

                    "\n\nPending PRs: " +
                    (
                        oDepartment.PendingPRs ||
                        0
                    ) +

                    "\n\nDelayed PRs: " +
                    (
                        oDepartment.DelayedPRs ||
                        0
                    ) +

                    "\n\nHigh Risk PRs: " +
                    (
                        oDepartment.HighRiskPRs ||
                        0
                    ) +

                    "\n\nBottleneck Level: " +
                    (
                        oDepartment.BottleneckLevel ||
                        "-"
                    ),

                    {
                        title:
                            "Department Bottleneck Details"
                    }
                );
            }

        }
    );
});