sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "vendor/onboarding/utils/formatter",
    "vendor/onboarding/utils/auth"
], function (Controller, Fragment, Filter, FilterOperator, MessageToast, MessageBox, formatter, auth) {
    "use strict";

    return Controller.extend("vendor.onboarding.controller.Approval", {

        formatter: formatter,

        // ─────────────────────────────────────────────────────────────────
        //  Lifecycle
        // ─────────────────────────────────────────────────────────────────

        onInit: function () {
            if (!auth.requireLogin(this)) return;

            var oStateModel = this.getOwnerComponent().getModel("state");
            this.getView().setModel(oStateModel, "state");
            oStateModel.setProperty("/currentUser",  auth.getUser());
            oStateModel.setProperty("/currentRoles", auth.getRoles().join(", "));

            this.getOwnerComponent().getRouter()
                .getRoute("approval")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            if (!auth.requireLogin(this)) return;
            this._applyStatusFilter("PENDING");
            this._updateSummaryCounts();
        },

        // ─────────────────────────────────────────────────────────────────
        //  Filtering
        // ─────────────────────────────────────────────────────────────────

        onStatusFilterChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            this._applyStatusFilter(sKey);
        },

        _applyStatusFilter: function (sStatus) {
            var oTable   = this.byId("stagingTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) return;
            oBinding.filter(sStatus === "ALL" ? [] : [new Filter("status", FilterOperator.EQ, sStatus)]);
        },

        onApprovalSearch: function (oEvent) {
            var sQuery   = oEvent.getParameter("query");
            var oTable   = this.byId("stagingTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            var aFilters = [];
            if (sQuery) {
                aFilters = [new Filter({
                    filters: [
                        new Filter("vendorCode", FilterOperator.Contains, sQuery),
                        new Filter("vendorName", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                })];
            }
            var sStatus = this.byId("statusFilter").getSelectedKey();
            if (sStatus && sStatus !== "ALL") {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }
            oBinding.filter(aFilters);
        },

        onRefresh: function () {
            this.byId("stagingTable").getBinding("items").refresh();
            this._updateSummaryCounts();
            MessageToast.show("Refreshed.");
        },

        // ─────────────────────────────────────────────────────────────────
        //  Approve flow
        // ─────────────────────────────────────────────────────────────────

        onApprovePress: function (oEvent) {
            var oVendor = oEvent.getSource().getBindingContext().getObject();
            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/pendingAction", {
                stagingID   : oVendor.ID,
                vendorName  : oVendor.vendorName,
                comment     : "",
                commentState: "None"
            });
            this._getApproveDialog().then(function (oDialog) { oDialog.open(); });
        },

        onApproveConfirm: function () {
            var oPending = this.getView().getModel("state").getProperty("/pendingAction");
            this._callAction("approveVendor", { stagingID: oPending.stagingID, comment: oPending.comment || "" })
                .then(function () {
                    this._approveDialogInstance.close();
                    MessageToast.show("✅ Vendor approved and moved to Master.");
                    this._refreshAndCount();
                }.bind(this))
                .catch(function (err) {
                    MessageBox.error("Approval failed: " + err.message);
                });
        },

        onApproveCancel: function () {
            if (this._approveDialogInstance) this._approveDialogInstance.close();
        },

        // ─────────────────────────────────────────────────────────────────
        //  Reject flow
        // ─────────────────────────────────────────────────────────────────

        onRejectPress: function (oEvent) {
            var oVendor = oEvent.getSource().getBindingContext().getObject();
            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/pendingAction", {
                stagingID   : oVendor.ID,
                vendorName  : oVendor.vendorName,
                comment     : "",
                commentState: "None"
            });
            this._getRejectDialog().then(function (oDialog) { oDialog.open(); });
        },

        onRejectConfirm: function () {
            var oStateModel = this.getView().getModel("state");
            var oPending    = oStateModel.getProperty("/pendingAction");

            if (!oPending.comment || oPending.comment.trim() === "") {
                oStateModel.setProperty("/pendingAction/commentState", "Error");
                MessageToast.show("Please enter a rejection reason.");
                return;
            }

            this._callAction("rejectVendor", { stagingID: oPending.stagingID, comment: oPending.comment.trim() })
                .then(function () {
                    this._rejectDialogInstance.close();
                    MessageToast.show("❌ Vendor rejected.");
                    this._refreshAndCount();
                }.bind(this))
                .catch(function (err) {
                    MessageBox.error("Rejection failed: " + err.message);
                });
        },

        onRejectCancel: function () {
            if (this._rejectDialogInstance) this._rejectDialogInstance.close();
        },

        // ─────────────────────────────────────────────────────────────────
        //  Navigation & logout
        // ─────────────────────────────────────────────────────────────────

        onNavBack           : function () { this.getOwnerComponent().getRouter().navTo("upload");   },
        onNavigateToUpload  : function () { this.getOwnerComponent().getRouter().navTo("upload");   },
        onNavigateToVendor  : function () { this.getOwnerComponent().getRouter().navTo("vendor");   },
        onLogout            : function () { auth.logout(this); },

        // ─────────────────────────────────────────────────────────────────
        //  Private helpers
        // ─────────────────────────────────────────────────────────────────

        /**
         * Calls a CAP unbound action via fetch() with Authorization header.
         */
        _callAction: function (sActionName, mParams) {
            var sUrl = window.location.origin + "/vendor/" + sActionName;
            return fetch(sUrl, auth.fetchOptions({
                method: "POST",
                body  : JSON.stringify(mParams)
            }))
            .then(function (res) {
                if (!res.ok) {
                    return res.json().then(function (e) {
                        throw new Error((e.error && e.error.message) || "HTTP " + res.status);
                    });
                }
                return res.json();
            });
        },

        _refreshAndCount: function () {
            this.byId("stagingTable").getBinding("items").refresh();
            this._updateSummaryCounts();
        },

        _updateSummaryCounts: function () {
            var oModel    = this.getView().getModel();
            var aStatuses = ["PENDING", "APPROVED", "REJECTED"];
            var mIdMap    = { "PENDING": "pendingCount", "APPROVED": "approvedCount", "REJECTED": "rejectedCount" };
            var nTotal    = 0;

            aStatuses.forEach(function (sStatus) {
                var oBinding = oModel.bindList("/StagingVendors", null, null,
                    [new Filter("status", FilterOperator.EQ, sStatus)], { $count: true });

                oBinding.requestContexts(0, 1000).then(function (aContexts) {
                    var oCtrl = this.byId(mIdMap[sStatus]);
                    if (oCtrl) oCtrl.setText(String(aContexts.length));

                    // Update total count
                    nTotal += aContexts.length;
                    var oTotal = this.byId("totalCount");
                    if (oTotal) oTotal.setText(String(nTotal));
                }.bind(this));
            }, this);
        },

        _getApproveDialog: function () {
            if (!this._approveDialogPromise) {
                this._approveDialogPromise = Fragment.load({
                    id: this.getView().getId(),
                    name: "vendor.onboarding.fragment.ApproveDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._approveDialogInstance = oDialog;
                    oDialog.setModel(this.getView().getModel("state"), "state");
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return this._approveDialogPromise;
        },

        _getRejectDialog: function () {
            if (!this._rejectDialogPromise) {
                this._rejectDialogPromise = Fragment.load({
                    id: this.getView().getId(),
                    name: "vendor.onboarding.fragment.RejectDialog",
                    controller: this
                }).then(function (oDialog) {
                    this._rejectDialogInstance = oDialog;
                    oDialog.setModel(this.getView().getModel("state"), "state");
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return this._rejectDialogPromise;
        }
    });
});
