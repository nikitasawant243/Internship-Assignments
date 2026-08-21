/**
 * Mock Auth Utility
 *
 * In BAS / local development, the CAP server uses a custom request header
 * to identify the current user instead of HTTP Basic Auth (which BAS's
 * reverse proxy blocks).
 *
 * This module reads the chosen user from sessionStorage (set by Login.controller)
 * and provides helpers to:
 *   - Get the current user name and roles
 *   - Build the Authorization header value for fetch() calls
 *   - Redirect to the login page if no session exists
 */

sap.ui.define([
    "sap/m/MessageBox"
], function (MessageBox) {
    "use strict";

    // Credentials matching .cdsrc.json users block
    var CREDENTIALS = {
        "uploader": "uploader123",
        "approver": "approver123",
        "admin"   : "admin123"
    };

    return {

        /**
         * Returns the currently logged-in mock user name from sessionStorage.
         * @returns {string|null}
         */
        getUser: function () {
            return sessionStorage.getItem("mockUser");
        },

        /**
         * Returns the roles array for the current user.
         * @returns {string[]}
         */
        getRoles: function () {
            try {
                return JSON.parse(sessionStorage.getItem("mockRoles") || "[]");
            } catch (e) {
                return [];
            }
        },

        /**
         * Returns true if the current user has the given role.
         * @param {string} sRole
         * @returns {boolean}
         */
        hasRole: function (sRole) {
            return this.getRoles().indexOf(sRole) !== -1;
        },

        /**
         * Returns the Basic Auth header value for the current user.
         * Used with fetch() calls to the CAP backend.
         * @returns {string}  e.g. "Basic dXBsb2FkZXI6dXBsb2FkZXIxMjM="
         */
        getAuthHeader: function () {
            var sUser = this.getUser();
            if (!sUser) return "";
            var sPass = CREDENTIALS[sUser] || sUser;
            return "Basic " + btoa(sUser + ":" + sPass);
        },

        /**
         * Returns fetch() options object with Authorization header pre-set.
         * @param {Object} [oExtra]  Additional fetch options to merge.
         * @returns {Object}
         */
        fetchOptions: function (oExtra) {
            var oOpts = Object.assign({
                headers: {
                    "Authorization": this.getAuthHeader(),
                    "Content-Type" : "application/json"
                }
            }, oExtra || {});
            return oOpts;
        },

        /**
         * Checks if a user is logged in. If not, navigates to the login page.
         * Call this in every controller's onInit.
         *
         * @param {sap.ui.core.mvc.Controller} oController
         * @returns {boolean}  true if logged in, false if redirected
         */
        requireLogin: function (oController) {
            if (!this.getUser()) {
                oController.getOwnerComponent().getRouter().navTo("login");
                return false;
            }
            return true;
        },

        /**
         * Clears the session and returns the user to the login screen.
         * @param {sap.ui.core.mvc.Controller} oController
         */
        logout: function (oController) {
            sessionStorage.removeItem("mockUser");
            sessionStorage.removeItem("mockRoles");
            oController.getOwnerComponent().getRouter().navTo("login");
        }
    };
});
