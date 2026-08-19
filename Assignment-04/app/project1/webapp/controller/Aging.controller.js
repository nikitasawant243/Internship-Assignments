sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/formatter"
], function (
    Controller,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast,
    MessageBox,
    Fragment,
    formatter
) {
    "use strict";

    return Controller.extend(
        "pr.tracker.project1.controller.Aging",
        {

            formatter: formatter,

            /**
             * =====================================================
             * INIT
             * =====================================================
             */
            onInit: function () {

                this._oTable =
                    this.byId("agingTable");

                this._oRouter =
                    this.getOwnerComponent()
                        .getRouter();

                this._sSearchQuery = "";

                /*
                 * Load PR data when the Aging route is opened.
                 */
                this._oRouter
                    .getRoute("Aging")
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

                if (
                    sQuery === undefined ||
                    sQuery === null
                ) {
                    sQuery = "";
                }

                this._sSearchQuery =
                    String(sQuery).trim();

                this._applyFilters();
            },


            /**
             * =====================================================
             * REFRESH
             * =====================================================
             */
            onRefresh: function () {

                this._refreshTable();

                MessageToast.show(
                    "PR aging data refreshed."
                );
            },


            /**
             * =====================================================
             * APPLY SEARCH/FILTER
             * =====================================================
             */
            _applyFilters: function () {

                var oBinding =
                    this._oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }


                var aFilters = [];


                /*
                 * Search across important PR fields.
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
                                    "MaterialDescription",
                                    FilterOperator.Contains,
                                    sQuery
                                ),

                                new Filter(
                                    "Priority",
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
             * SORT
             * =====================================================
             */
            onSort: function () {

                if (!this._oTable) {
                    return;
                }


                var oBinding =
                    this._oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }


                /*
                 * Toggle between ascending and descending.
                 */
                this._bSortDescending =
                    !this._bSortDescending;


                var oSorter =
                    new Sorter(
                        "PRAging",
                        this._bSortDescending
                    );


                oBinding.sort(
                    oSorter
                );
            },


            /**
             * =====================================================
             * FILTER BY SLA STATUS
             * =====================================================
             */
            onFilterSLA: function (oEvent) {

                var sKey =
                    oEvent.getParameter("selectedKey");

                var oBinding =
                    this._oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }


                if (
                    !sKey ||
                    sKey === "ALL"
                ) {

                    this._applyFilters();

                    return;
                }


                var aFilters = [];


                /*
                 * Keep search filter as well.
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
                                    "MaterialDescription",
                                    FilterOperator.Contains,
                                    sQuery
                                )

                            ],

                            and: false
                        })
                    );
                }


                aFilters.push(
                    new Filter(
                        "SLAStatus",
                        FilterOperator.EQ,
                        sKey
                    )
                );


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


                /*
                 * Store selected PR for actions.
                 */
                this._oSelectedContext =
                    oContext;


                /*
                 * At the moment there is no separate
                 * detail page in the existing structure.
                 *
                 * Show a compact detail dialog instead.
                 */
                this._showPRDetails(
                    oPR
                );
            },


            /**
             * =====================================================
             * SHOW PR DETAILS
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

                    "\n\nPR Aging: " +
                    (oPR.PRAging || 0) +
                    " days" +

                    "\n\nSLA: " +
                    (oPR.SLAInDays || 0) +
                    " days" +

                    "\n\nSLA Status: " +
                    (oPR.SLAStatus || "-") +

                    "\n\nRisk: " +
                    (oPR.RiskLevel || "-") +

                    "\n\nRisk Score: " +
                    (oPR.RiskScore || 0) +

                    "\n\nPriority: " +
                    (oPR.Priority || "-") +

                    "\n\nStatus: " +
                    (oPR.Status || "-");


                MessageBox.information(
                    sMessage,
                    {
                        title: "Purchase Requisition Details"
                    }
                );
            },


            /**
             * =====================================================
             * APPROVE PR
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
                        title: "Approve PR",

                        onClose: function (
                            sAction
                        ) {

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
             * REJECT PR
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
                        title: "Reject PR",

                        onClose: function (
                            sAction
                        ) {

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
                                        "Rejected from PR Aging Report"
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
                        title: "Mark as Urgent",

                        onClose: function (
                            sAction
                        ) {

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
                            title: "Create Purchase Order",

                            onClose: function (
                                sAction
                            ) {

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
             * GET CONTEXT FROM EVENT
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
             * EXECUTE ODATA ACTION
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


                /*
                 * OData V4 bound action.
                 *
                 * Example:
                 *
                 * /PurchaseRequisition(ID)/approve(...)
                 */
                var oAction =
                    oContext
                        .bindAction(
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


                            /*
                             * Refresh the binding so
                             * calculated fields and
                             * status are updated.
                             */
                            this._refreshTable();

                        }.bind(this)
                    )
                    .catch(
                        function (oError) {

                            console.error(
                                "Action failed:",
                                oError
                            );


                            var sMessage =
                                "Unable to complete the requested action.";


                            if (
                                oError &&
                                oError.message
                            ) {

                                sMessage =
                                    oError.message;
                            }


                            MessageBox.error(
                                sMessage
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
                 * Refresh the OData V4 list binding.
                 */
                oBinding.refresh();
            }

        }
    );
});