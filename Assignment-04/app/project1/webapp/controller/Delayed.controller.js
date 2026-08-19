sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../model/formatter"
], function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    MessageBox,
    formatter
) {
    "use strict";

    return Controller.extend(
        "pr.tracker.project1.controller.Delayed",
        {

            formatter: formatter,


            /**
             * =====================================================
             * INIT
             * =====================================================
             */
            onInit: function () {

                this._oTable =
                    this.byId("delayedTable");

                this._oRouter =
                    this.getOwnerComponent()
                        .getRouter();

                this._sSearchQuery = "";

                this._bSortDescending = true;


                /*
                 * Load data whenever the Delayed route
                 * is opened.
                 */
                this._oRouter
                    .getRoute("Delayed")
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

                this._refreshTable();
            },


            /**
             * =====================================================
             * SEARCH
             * =====================================================
             */
            onSearch: function (oEvent) {

                var sQuery =
                    oEvent.getParameter("query");


                /*
                 * liveChange uses newValue instead of query.
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
                    ).trim();


                this._applyFilters();
            },


            /**
             * =====================================================
             * APPLY FILTERS
             * =====================================================
             */
            _applyFilters: function () {

                if (!this._oTable) {
                    return;
                }


                var oBinding =
                    this._oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {
                    return;
                }


                var aFilters = [];


                /*
                 * IMPORTANT:
                 *
                 * Only delayed PRs.
                 *
                 * DelayDays > 0
                 */
                aFilters.push(
                    new Filter(
                        "DelayDays",
                        FilterOperator.GT,
                        0
                    )
                );


                /*
                 * Search across multiple fields.
                 */
                if (this._sSearchQuery) {

                    var sQuery =
                        this._sSearchQuery;


                    aFilters.push(
                        new Filter({
                            filters: [

                                new Filter(
                                    "PRNumber",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Department",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Status",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Priority",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Vendor",
                                    FilterOperator.Contains,
                                    sQuery
                                )

                            ],

                            and: false
                        })
                    );
                }


                /*
                 * Apply all filters.
                 */
                oBinding.filter(
                    aFilters
                );
            },


            /**
             * =====================================================
             * REFRESH
             * =====================================================
             */
            onRefresh: function () {

                this._refreshTable();

                MessageToast.show(
                    "Delayed approvals refreshed."
                );
            },


            /**
             * =====================================================
             * SORT BY DELAY
             * =====================================================
             */
            onSort: function () {

                if (!this._oTable) {
                    return;
                }


                var oBinding =
                    this._oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {
                    return;
                }


                this._bSortDescending =
                    !this._bSortDescending;


                var oSorter =
                    new Sorter(
                        "DelayDays",
                        this._bSortDescending
                    );


                oBinding.sort(
                    oSorter
                );
            },


            /**
             * =====================================================
             * SORT BY APPROVAL CYCLE
             * =====================================================
             */
            onSortApprovalCycle: function () {

                if (!this._oTable) {
                    return;
                }


                var oBinding =
                    this._oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {
                    return;
                }


                this._bApprovalSortDescending =
                    !this._bApprovalSortDescending;


                var oSorter =
                    new Sorter(
                        "ApprovalCycleTime",
                        this._bApprovalSortDescending
                    );


                oBinding.sort(
                    oSorter
                );
            },


            /**
             * =====================================================
             * FILTER BY RISK
             * =====================================================
             */
            onFilterRisk: function (oEvent) {

                var sKey =
                    oEvent.getParameter(
                        "selectedKey"
                    );


                if (!this._oTable) {
                    return;
                }


                var oBinding =
                    this._oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {
                    return;
                }


                /*
                 * Always retain delayed PR filter.
                 */
                var aFilters = [

                    new Filter(
                        "DelayDays",
                        FilterOperator.GT,
                        0
                    )

                ];


                /*
                 * Apply selected risk filter.
                 */
                if (
                    sKey &&
                    sKey !== "ALL"
                ) {

                    aFilters.push(
                        new Filter(
                            "RiskLevel",
                            FilterOperator.EQ,
                            sKey
                        )
                    );
                }


                /*
                 * Apply search filter.
                 */
                if (this._sSearchQuery) {

                    var sQuery =
                        this._sSearchQuery;


                    aFilters.push(
                        new Filter({
                            filters: [

                                new Filter(
                                    "PRNumber",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Department",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Status",
                                    FilterOperator.Contains,
                                    sQuery
                                )

                            ],

                            and: false
                        })
                    );
                }


                oBinding.filter(
                    aFilters
                );
            },


            /**
             * =====================================================
             * ROW PRESS
             * =====================================================
             */
            onRowPress: function (oEvent) {

                var oItem =
                    oEvent.getParameter(
                        "listItem"
                    );


                if (!oItem) {
                    return;
                }


                var oContext =
                    oItem.getBindingContext();


                if (!oContext) {
                    return;
                }


                var oPR =
                    oContext.getObject();


                this._oSelectedContext =
                    oContext;


                this._showPRDetails(
                    oPR
                );
            },


            /**
             * =====================================================
             * SHOW DETAILS
             * =====================================================
             */
            _showPRDetails: function (oPR) {

                var sMessage =
                    "PR Number: " +
                    (oPR.PRNumber || "-") +

                    "\n\nDepartment: " +
                    (oPR.Department || "-") +

                    "\n\nCreated: " +
                    (oPR.CreatedDate || "-") +

                    "\n\nApproval Date: " +
                    (oPR.ApprovalDate || "Pending") +

                    "\n\nSLA: " +
                    (oPR.SLAInDays || 0) +
                    " days" +

                    "\n\nApproval Cycle: " +
                    (oPR.ApprovalCycleTime || 0) +
                    " days" +

                    "\n\nDelay: " +
                    (oPR.DelayDays || 0) +
                    " days" +

                    "\n\nDelay %: " +
                    Number(
                        oPR.DelayPercentage || 0
                    ).toFixed(2) +
                    "%" +

                    "\n\nRisk: " +
                    (oPR.RiskLevel || "-") +

                    "\n\nRisk Score: " +
                    (oPR.RiskScore || 0);


                MessageBox.information(
                    sMessage,
                    {
                        title:
                            "Delayed PR Details"
                    }
                );
            },


            /**
             * =====================================================
             * APPROVE
             * =====================================================
             */
            onApprove: function (oEvent) {

                var oContext =
                    this._getContextFromEvent(
                        oEvent
                    );


                if (!oContext) {
                    return;
                }


                var oPR =
                    oContext.getObject();


                MessageBox.confirm(
                    "Approve Purchase Requisition " +
                    oPR.PRNumber +
                    "?",
                    {
                        title:
                            "Approve PR",

                        onClose:
                            function (sAction) {

                                if (
                                    sAction !==
                                    MessageBox.Action.OK
                                ) {
                                    return;
                                }


                                this._executeAction(
                                    oContext,
                                    "approve",
                                    {},
                                    "Purchase Requisition approved successfully."
                                );

                            }.bind(this)
                    }
                );
            },


            /**
             * =====================================================
             * REJECT
             * =====================================================
             */
            onReject: function (oEvent) {

                var oContext =
                    this._getContextFromEvent(
                        oEvent
                    );


                if (!oContext) {
                    return;
                }


                var oPR =
                    oContext.getObject();


                MessageBox.confirm(
                    "Reject Purchase Requisition " +
                    oPR.PRNumber +
                    "?",
                    {
                        title:
                            "Reject PR",

                        onClose:
                            function (sAction) {

                                if (
                                    sAction !==
                                    MessageBox.Action.OK
                                ) {
                                    return;
                                }


                                this._executeAction(
                                    oContext,
                                    "reject",
                                    {
                                        reason:
                                            "Rejected from Delayed Approvals"
                                    },
                                    "Purchase Requisition rejected."
                                );

                            }.bind(this)
                    }
                );
            },


            /**
             * =====================================================
             * MARK URGENT
             * =====================================================
             */
            onMarkUrgent: function (oEvent) {

                var oContext =
                    this._getContextFromEvent(
                        oEvent
                    );


                if (!oContext) {
                    return;
                }


                var oPR =
                    oContext.getObject();


                MessageBox.confirm(
                    "Mark PR " +
                    oPR.PRNumber +
                    " as urgent?",
                    {
                        title:
                            "Mark as Urgent",

                        onClose:
                            function (sAction) {

                                if (
                                    sAction !==
                                    MessageBox.Action.OK
                                ) {
                                    return;
                                }


                                this._executeAction(
                                    oContext,
                                    "markAsUrgent",
                                    {},
                                    "PR marked as urgent."
                                );

                            }.bind(this)
                    }
                );
            },


            /**
             * =====================================================
             * CREATE PURCHASE ORDER
             * =====================================================
             */
            onCreatePurchaseOrder:
                function (oEvent) {

                    var oContext =
                        this._getContextFromEvent(
                            oEvent
                        );


                    if (!oContext) {
                        return;
                    }


                    var oPR =
                        oContext.getObject();


                    if (
                        String(
                            oPR.Status || ""
                        ).toUpperCase() !==
                        "APPROVED"
                    ) {

                        MessageBox.warning(
                            "A Purchase Order can only be created for an approved PR."
                        );

                        return;
                    }


                    MessageBox.confirm(
                        "Create Purchase Order for PR " +
                        oPR.PRNumber +
                        "?",
                        {
                            title:
                                "Create Purchase Order",

                            onClose:
                                function (sAction) {

                                    if (
                                        sAction !==
                                        MessageBox.Action.OK
                                    ) {
                                        return;
                                    }


                                    this._executeAction(
                                        oContext,
                                        "createPurchaseOrder",
                                        {
                                            vendor:
                                                oPR.Vendor ||
                                                "Default Vendor",

                                            totalAmount:
                                                Number(
                                                    oPR.EstimatedCost ||
                                                    0
                                                )
                                        },
                                        "Purchase Order created successfully."
                                    );

                                }.bind(this)
                        }
                    );
                },


            /**
             * =====================================================
             * GET CONTEXT
             * =====================================================
             */
            _getContextFromEvent:
                function (oEvent) {

                    var oSource =
                        oEvent.getSource();


                    var oContext =
                        oSource.getBindingContext();


                    if (oContext) {
                        return oContext;
                    }


                    if (
                        this._oSelectedContext
                    ) {
                        return this._oSelectedContext;
                    }


                    MessageToast.show(
                        "Please select a Purchase Requisition."
                    );


                    return null;
                },


            /**
             * =====================================================
             * EXECUTE BOUND ACTION
             * =====================================================
             */
            _executeAction: function (
                oContext,
                sAction,
                oParameters,
                sSuccessMessage
            ) {

                if (!oContext) {
                    return;
                }


                var oAction =
                    oContext.bindAction(
                        sAction
                    );


                Object.keys(
                    oParameters || {}
                ).forEach(
                    function (sParameter) {

                        oAction.setParameter(
                            sParameter,
                            oParameters[
                                sParameter
                            ]
                        );

                    }
                );


                oAction.execute()
                    .then(
                        function () {

                            MessageToast.show(
                                sSuccessMessage
                            );


                            this._refreshTable();

                        }.bind(this)
                    )
                    .catch(
                        function (oError) {

                            console.error(
                                "OData action error:",
                                oError
                            );


                            MessageBox.error(
                                oError.message ||
                                "Unable to complete the requested action."
                            );

                        }.bind(this)
                    );
            },


            /**
             * =====================================================
             * REFRESH TABLE
             * =====================================================
             */
            _refreshTable: function () {

                if (!this._oTable) {
                    return;
                }


                var oBinding =
                    this._oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {
                    return;
                }


                /*
                 * Apply delayed filter after
                 * the table binding exists.
                 */
                this._applyFilters();
            }

        }
    );
});