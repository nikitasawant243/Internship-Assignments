sap.ui.define([], function () {
    "use strict";

    /**
     * Formatter utilities shared across all views.
     */
    return {

        /**
         * Returns a human-readable label for a vendor status code.
         * @param {string} sStatus
         * @returns {string}
         */
        statusText: function (sStatus) {
            var mLabels = {
                "PENDING" : "Pending",
                "APPROVED": "Approved",
                "REJECTED": "Rejected",
                "INVALID" : "Invalid"
            };
            return mLabels[sStatus] || sStatus || "—";
        },

        /**
         * Returns the sap.ui.core.ValueState / MessageStrip type for a status.
         * Used for ObjectStatus and highlighting.
         * @param {string} sStatus
         * @returns {string}  "Warning" | "Success" | "Error" | "None"
         */
        statusState: function (sStatus) {
            var mStates = {
                "PENDING" : "Warning",
                "APPROVED": "Success",
                "REJECTED": "Error",
                "INVALID" : "Error"
            };
            return mStates[sStatus] || "None";
        },

        /**
         * Returns a CSS class name for status badge colouring.
         * @param {string} sStatus
         * @returns {string}
         */
        statusClass: function (sStatus) {
            var mClasses = {
                "PENDING" : "statusPending",
                "APPROVED": "statusApproved",
                "REJECTED": "statusRejected",
                "INVALID" : "statusInvalid"
            };
            return mClasses[sStatus] || "";
        },

        /**
         * Formats a numeric amount as Indian Rupee currency.
         * @param {number|string} nAmount
         * @returns {string}  e.g. "₹12,50,000.00"
         */
        formatCurrency: function (nAmount) {
            if (nAmount === null || nAmount === undefined || nAmount === "") {
                return "—";
            }
            var num = parseFloat(nAmount);
            if (isNaN(num)) return "—";
            return "₹" + num.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        /**
         * Formats an ISO timestamp to a readable local date-time string.
         * @param {string} sTimestamp
         * @returns {string}
         */
        formatDateTime: function (sTimestamp) {
            if (!sTimestamp) return "—";
            var d = new Date(sTimestamp);
            if (isNaN(d.getTime())) return sTimestamp;
            return d.toLocaleString("en-IN", {
                day  : "2-digit",
                month: "short",
                year : "numeric",
                hour : "2-digit",
                minute: "2-digit"
            });
        },

        /**
         * Returns true when a status requires the Approve/Reject buttons to be shown.
         * @param {string} sStatus
         * @returns {boolean}
         */
        isPending: function (sStatus) {
            return sStatus === "PENDING";
        },

        /**
         * Returns a boolean whether there are approval reasons to display.
         * @param {string} sReasons
         * @returns {boolean}
         */
        hasApprovalReasons: function (sReasons) {
            return !!(sReasons && sReasons.trim().length > 0);
        }
    };
});
