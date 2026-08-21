sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "vendor/onboarding/utils/formatter"
], function (Controller, Filter, FilterOperator, MessageToast, formatter) {
    "use strict";

    return Controller.extend("vendor.onboarding.controller.Vendor", {

        // Expose formatter to view bindings
        formatter: formatter,

        // ─────────────────────────────────────────────────────────────────
        //  Lifecycle
        // ─────────────────────────────────────────────────────────────────

        onInit: function () {
            this.getView().setModel(
                this.getOwnerComponent().getModel("state"), "state"
            );

            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/selectedVendorID",   null);
            oStateModel.setProperty("/selectedVendorName", "");

            // Update count when route is matched
            this.getOwnerComponent().getRouter()
                .getRoute("vendor")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._refreshCount();
        },

        // ─────────────────────────────────────────────────────────────────
        //  Search
        // ─────────────────────────────────────────────────────────────────

        onSearch: function (oEvent) {
            this._applySearch(oEvent.getParameter("query"));
        },

        onSearchLive: function (oEvent) {
            this._applySearch(oEvent.getParameter("newValue"));
        },

        _applySearch: function (sQuery) {
            var oTable   = this.byId("vendorTable");
            var oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            var aFilters = [];
            if (sQuery && sQuery.trim()) {
                aFilters = [new Filter({
                    filters: [
                        new Filter("vendorCode", FilterOperator.Contains, sQuery.trim()),
                        new Filter("vendorName", FilterOperator.Contains, sQuery.trim())
                    ],
                    and: false
                })];
            }
            oBinding.filter(aFilters);
        },

        // ─────────────────────────────────────────────────────────────────
        //  Row selection → Audit Trail
        // ─────────────────────────────────────────────────────────────────

        onVendorSelect: function (oEvent) {
            var oItem    = oEvent.getParameter("listItem") ||
                           (oEvent.getParameter("listItems") || [])[0];
            if (!oItem) return;

            var oVendor     = oItem.getBindingContext().getObject();
            var oStateModel = this.getView().getModel("state");

            oStateModel.setProperty("/selectedVendorID",   oVendor.ID);
            oStateModel.setProperty("/selectedVendorName", oVendor.vendorName);

            // Bind audit table to logs for this vendor's staging ID
            var oAuditTable   = this.byId("auditTable");
            var oAuditBinding = oAuditTable.getBinding("items");
            if (oAuditBinding) {
                oAuditBinding.filter([
                    new Filter("entityID", FilterOperator.EQ, oVendor.stagingID || oVendor.ID)
                ]);
            } else {
                // Set binding with filter directly
                oAuditTable.bindItems({
                    path: "/AuditLogs",
                    filters: [new Filter("entityID", FilterOperator.EQ, oVendor.stagingID || oVendor.ID)],
                    parameters: { $orderby: "changedAt desc" },
                    template: oAuditTable.getBindingInfo("items") && oAuditTable.getBindingInfo("items").template
                });
            }

            // Expand the audit panel
            var oAuditPanel = this.byId("auditPanel");
            if (oAuditPanel) oAuditPanel.setExpanded(true);
        },

        onCloseAudit: function () {
            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/selectedVendorID",   null);
            oStateModel.setProperty("/selectedVendorName", "");
        },

        // ─────────────────────────────────────────────────────────────────
        //  Export to Excel (client-side via SheetJS)
        // ─────────────────────────────────────────────────────────────────

        onExport: function () {
            /* global XLSX */
            var oTable    = this.byId("vendorTable");
            var aContexts = oTable.getBinding("items").getAllCurrentContexts();

            if (!aContexts || aContexts.length === 0) {
                MessageToast.show("No data to export.");
                return;
            }

            var aData = aContexts.map(function (oCtx) {
                var o = oCtx.getObject();
                return {
                    "Vendor Code"  : o.vendorCode,
                    "Vendor Name"  : o.vendorName,
                    "PAN Number"   : o.panNumber,
                    "GST Number"   : o.gstNumber,
                    "Country"      : o.country_code,
                    "Bank Account" : o.bankAccount,
                    "IFSC"         : o.ifscCode,
                    "Credit Limit" : o.creditLimit,
                    "Approved By"  : o.approvedBy,
                    "Approved At"  : o.approvedAt
                };
            });

            var ws = XLSX.utils.json_to_sheet(aData);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Vendor Master");
            XLSX.writeFile(wb, "vendor-master-" + new Date().toISOString().slice(0, 10) + ".xlsx");
            MessageToast.show("Export complete.");
        },

        // ─────────────────────────────────────────────────────────────────
        //  Refresh
        // ─────────────────────────────────────────────────────────────────

        onRefresh: function () {
            this.byId("vendorTable").getBinding("items").refresh();
            this._refreshCount();
            MessageToast.show("Refreshed.");
        },

        _refreshCount: function () {
            var oTable = this.byId("vendorTable");
            if (!oTable) return;

            var oBinding = oTable.getBinding("items");
            if (!oBinding) return;

            oBinding.requestContexts(0, 10000).then(function (aCtx) {
                var oCount = this.byId("vendorCount");
                if (oCount) oCount.setText(String(aCtx.length));
            }.bind(this));
        },

        // ─────────────────────────────────────────────────────────────────
        //  Navigation
        // ─────────────────────────────────────────────────────────────────

        onNavBack           : function () { this.getOwnerComponent().getRouter().navTo("upload");   },
        onNavigateToUpload  : function () { this.getOwnerComponent().getRouter().navTo("upload");   },
        onNavigateToApproval: function () { this.getOwnerComponent().getRouter().navTo("approval"); },
        onLogout            : function () { auth.logout(this); }
    });
});
