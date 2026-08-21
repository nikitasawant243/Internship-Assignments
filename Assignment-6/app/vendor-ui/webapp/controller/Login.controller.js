sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    var ROLE_CONFIG = {
        "uploader": {
            label: "Uploader — Upload & submit vendor Excel files",
            roles: ["Uploader"],
            user : "uploader"
        },
        "approver": {
            label: "Approver — Approve or Reject pending vendors",
            roles: ["Approver"],
            user : "approver"
        },
        "admin": {
            label: "Admin — Both Uploader & Approver",
            roles: ["Uploader", "Approver"],
            user : "admin"
        }
    };

    return Controller.extend("vendor.onboarding.controller.Login", {

        onInit: function () {
            // If already logged in (page refresh), go straight to upload
            if (sessionStorage.getItem("mockUser")) {
                this.getOwnerComponent().getRouter().navTo("upload");
            }
        },

        // ── Three dedicated handlers — one per role button ─────────────

        onLoginUploader: function () {
            this._selectRole("uploader");
        },

        onLoginApprover: function () {
            this._selectRole("approver");
        },

        onLoginAdmin: function () {
            this._selectRole("admin");
        },

        // ── Shared selection logic ──────────────────────────────────────

        _selectRole: function (sRole) {
            var oConfig = ROLE_CONFIG[sRole];
            if (!oConfig) return;

            this._selectedRole = sRole;

            // Highlight the selected button, reset the others
            var mBtnMap = {
                "uploader": "btnUploader",
                "approver": "btnApprover",
                "admin"   : "btnAdmin"
            };
            Object.keys(mBtnMap).forEach(function (key) {
                var oBtn = this.byId(mBtnMap[key]);
                if (!oBtn) return;
                oBtn.setType(key === sRole ? "Emphasized" : "Default");
            }.bind(this));

            // Show feedback
            var oStrip = this.byId("feedbackStrip");
            oStrip.setText("✔  Selected: " + oConfig.label);
            oStrip.setVisible(true);

            // Enable Enter button
            this.byId("enterBtn").setEnabled(true);

            MessageToast.show("Role selected: " + oConfig.user);
        },

        // ── Enter the application ───────────────────────────────────────

        onEnter: function () {
            if (!this._selectedRole) {
                MessageToast.show("Please select a role first.");
                return;
            }

            var oConfig = ROLE_CONFIG[this._selectedRole];

            // Save to sessionStorage — cleared when the tab is closed
            sessionStorage.setItem("mockUser",  oConfig.user);
            sessionStorage.setItem("mockRoles", JSON.stringify(oConfig.roles));

            // Navigate to the upload screen
            this.getOwnerComponent().getRouter().navTo("upload");
        }
    });
});
