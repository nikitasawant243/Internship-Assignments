sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "vendor/onboarding/utils/auth"
], function (Controller, JSONModel, MessageToast, MessageBox, auth) {
    "use strict";

    var COLUMN_MAP = {
        "vendor code"    : "vendorCode",
        "vendor name"    : "vendorName",
        "pan number"     : "panNumber",
        "pan no"         : "panNumber",
        "gst number"     : "gstNumber",
        "gst no"         : "gstNumber",
        "country"        : "country",
        "bank account"   : "bankAccount",
        "bank account no": "bankAccount",
        "ifsc"           : "ifscCode",
        "ifsc code"      : "ifscCode",
        "credit limit"   : "creditLimit"
    };

    return Controller.extend("vendor.onboarding.controller.Upload", {

        // ─────────────────────────────────────────────────────────────────
        //  Lifecycle
        // ─────────────────────────────────────────────────────────────────

        onInit: function () {
            if (!auth.requireLogin(this)) return;

            var oStateModel = this.getOwnerComponent().getModel("state");
            this.getView().setModel(oStateModel, "state");
            this._resetState();

            // Show current user in header
            oStateModel.setProperty("/currentUser",  auth.getUser());
            oStateModel.setProperty("/currentRoles", auth.getRoles().join(", "));
        },

        // ─────────────────────────────────────────────────────────────────
        //  File selection — client-side Excel parse
        // ─────────────────────────────────────────────────────────────────

        onFileChange: function (oEvent) {
            var oFile = oEvent.getParameter("files")[0];
            if (!oFile) return;

            if (!oFile.name.endsWith(".xlsx")) {
                MessageBox.error("Please select a valid .xlsx file.");
                return;
            }

            var oReader = new FileReader();
            oReader.onload = function (e) {
                try {
                    var aRows = this._parseExcelBuffer(e.target.result);
                    this._setPreview(aRows);
                    this._setMessage(aRows.length + " row(s) loaded. Click Upload & Validate.", "Information");
                } catch (err) {
                    MessageBox.error("Failed to parse Excel file: " + err.message);
                }
            }.bind(this);
            oReader.readAsArrayBuffer(oFile);
        },

        _parseExcelBuffer: function (buffer) {
            /* global XLSX */
            var workbook  = XLSX.read(buffer, { type: "array", cellDates: true });
            var sheetName = workbook.SheetNames[0];
            if (!sheetName) throw new Error("No sheets found in the Excel file.");

            var sheet   = workbook.Sheets[sheetName];
            var rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            if (rawRows.length < 2) return [];

            var headers = rawRows[0];
            var colMap  = {};
            headers.forEach(function (cell, idx) {
                var key = String(cell).trim().toLowerCase();
                if (COLUMN_MAP[key]) colMap[idx] = COLUMN_MAP[key];
            });

            var rows = [];
            for (var i = 1; i < rawRows.length; i++) {
                var rawRow = rawRows[i];
                if (rawRow.every(function (c) { return c === "" || c === null; })) continue;
                var row = { rowNumber: i };
                Object.keys(colMap).forEach(function (colIdx) {
                    var field = colMap[colIdx];
                    var val   = rawRow[colIdx];
                    row[field] = (field === "creditLimit")
                        ? (val === "" ? null : parseFloat(val))
                        : (val === null || val === undefined ? "" : String(val).trim());
                });
                rows.push(row);
            }
            return rows;
        },

        // ─────────────────────────────────────────────────────────────────
        //  Submit to server via fetch() with Authorization header
        // ─────────────────────────────────────────────────────────────────

        onValidateAndUpload: function () {
            var oStateModel = this.getView().getModel("state");
            var aRows       = oStateModel.getProperty("/uploadPreview");

            if (!aRows || aRows.length === 0) {
                MessageBox.warning("Please select an Excel file first.");
                return;
            }

            oStateModel.setProperty("/busy", true);
            this._setMessage("", "");

            // Build the OData action URL — works in both BAS and local
            var sBase    = window.location.origin;
            var sUrl     = sBase + "/vendor/uploadVendors";

            fetch(sUrl, auth.fetchOptions({
                method: "POST",
                body  : JSON.stringify({ payload: aRows })
            }))
            .then(function (res) {
                if (!res.ok) {
                    return res.json().then(function (e) {
                        throw new Error((e.error && e.error.message) || "HTTP " + res.status);
                    });
                }
                return res.json();
            })
            .then(function (oData) {
                // OData V4 action result is wrapped in { value: ... }
                var oResult = oData.value !== undefined ? oData.value : oData;
                this._handleUploadResult(oResult);
                oStateModel.setProperty("/busy", false);
            }.bind(this))
            .catch(function (err) {
                oStateModel.setProperty("/busy", false);
                MessageBox.error("Upload error: " + err.message);
            });
        },

        _handleUploadResult: function (oResult) {
            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/uploadResult",     oResult);
            oStateModel.setProperty("/validationErrors", oResult.errors || []);

            if (oResult.invalidRows > 0) {
                this._setMessage(
                    oResult.validRows + " row(s) submitted. " +
                    oResult.invalidRows + " row(s) have errors (see table below).",
                    "Warning"
                );
            } else {
                this._setMessage(
                    "All " + oResult.validRows + " row(s) successfully submitted for approval.",
                    "Success"
                );
                MessageToast.show("✅ Upload complete! " + oResult.validRows + " vendor(s) pending approval.");
            }
        },

        // ─────────────────────────────────────────────────────────────────
        //  Template download
        // ─────────────────────────────────────────────────────────────────

        onDownloadTemplate: function () {
            /* global XLSX */
            var ws = XLSX.utils.aoa_to_sheet([[
                "Vendor Code","Vendor Name","PAN Number","GST Number",
                "Country","Bank Account","IFSC","Credit Limit"
            ]]);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Vendors");
            XLSX.writeFile(wb, "vendor-upload-template.xlsx");
            MessageToast.show("Template downloaded.");
        },

        // ─────────────────────────────────────────────────────────────────
        //  Navigation & logout
        // ─────────────────────────────────────────────────────────────────

        onNavigateToApproval: function () {
            this.getOwnerComponent().getRouter().navTo("approval");
        },

        onNavigateToVendor: function () {
            this.getOwnerComponent().getRouter().navTo("vendor");
        },

        onLogout: function () {
            auth.logout(this);
        },

        // ─────────────────────────────────────────────────────────────────
        //  Helpers
        // ─────────────────────────────────────────────────────────────────

        onClear: function () {
            this._resetState();
            this.byId("fileUploader").clear();
            MessageToast.show("Cleared.");
        },

        _setPreview: function (aRows) {
            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/uploadPreview",    aRows);
            oStateModel.setProperty("/validationErrors", []);
            oStateModel.setProperty("/uploadResult",     null);
        },

        _setMessage: function (sText, sType) {
            var oStateModel = this.getView().getModel("state");
            oStateModel.setProperty("/uploadResultMessage", sText);
            oStateModel.setProperty("/uploadResultType",    sType || "None");
        },

        _resetState: function () {
            var oStateModel = this.getView().getModel("state");
            if (!oStateModel) return;
            oStateModel.setProperty("/uploadPreview",       []);
            oStateModel.setProperty("/validationErrors",    []);
            oStateModel.setProperty("/uploadResult",        null);
            oStateModel.setProperty("/uploadResultMessage", "");
            oStateModel.setProperty("/uploadResultType",    "None");
            oStateModel.setProperty("/busy",                false);
        }
    });
});
