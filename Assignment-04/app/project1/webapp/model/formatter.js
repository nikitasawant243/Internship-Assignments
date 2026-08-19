sap.ui.define([], function () {
    "use strict";

    return {

        /* =========================================================
         * RISK STATE
         * ========================================================= */

        riskState: function (sRisk) {

            if (!sRisk) {
                return "None";
            }

            switch (String(sRisk).toUpperCase()) {

                case "HIGH":
                    return "Error";

                case "MEDIUM":
                    return "Warning";

                case "LOW":
                    return "Success";

                default:
                    return "None";
            }
        },


        /* =========================================================
         * RISK TEXT
         * ========================================================= */

        riskText: function (sRisk, iScore) {

            if (!sRisk) {
                return "-";
            }

            var riskText = String(sRisk).toUpperCase();
            var score = iScore ? " (" + iScore + ")" : "";

            switch (riskText) {

                case "HIGH":
                    return "HIGH" + score;

                case "MEDIUM":
                    return "MEDIUM" + score;

                case "LOW":
                    return "LOW" + score;

                default:
                    return sRisk + score;
            }
        },


        /* =========================================================
         * RISK SCORE STATE
         * ========================================================= */

        riskScoreState: function (vScore) {

            var iScore = Number(vScore);

            if (isNaN(iScore)) {
                return "None";
            }

            if (iScore >= 70) {
                return "Error";
            }

            if (iScore >= 40) {
                return "Warning";
            }

            return "Success";
        },


        /* =========================================================
         * SLA STATE
         * ========================================================= */

        slaState: function (sStatus) {

            if (!sStatus) {
                return "None";
            }

            switch (String(sStatus).toUpperCase()) {

                case "WITHIN_SLA":
                case "WITHIN SLA":
                    return "Success";

                case "AT_RISK":
                case "AT RISK":
                    return "Warning";

                case "BREACHED":
                    return "Error";

                default:
                    return "None";
            }
        },


        /* =========================================================
         * AGING STATE
         * ========================================================= */

        agingState: function (
            iAging,
            iSLA
        ) {

            var aging = Number(iAging);
            var sla = Number(iSLA);

            if (isNaN(aging) || isNaN(sla)) {
                return "None";
            }

            if (aging > sla) {
                return "Error";
            }

            if (
                aging === sla ||
                aging === sla - 1
            ) {
                return "Warning";
            }

            return "Success";
        },


        /* =========================================================
         * DELAY STATE
         * ========================================================= */

        delayState: function (iDelay) {

            var delay = Number(iDelay);

            if (isNaN(delay) || delay <= 0) {
                return "Success";
            }

            if (delay <= 2) {
                return "Warning";
            }

            return "Error";
        },


        /* =========================================================
         * DELAY PERCENTAGE STATE
         * ========================================================= */

        delayPercentageState: function (
            vPercentage
        ) {

            var percentage =
                Number(vPercentage);

            if (isNaN(percentage)) {
                return "None";
            }

            if (percentage <= 0) {
                return "Success";
            }

            if (percentage <= 50) {
                return "Warning";
            }

            return "Error";
        },


        /* =========================================================
         * BOTTLENECK STATE
         * ========================================================= */

        bottleneckState: function (
            vDelayed,
            vHighRisk
        ) {

            /*
             * Supports both:
             *
             * bottleneckState("HIGH")
             *
             * and
             *
             * bottleneckState(
             *     delayedPRs,
             *     highRiskPRs
             * )
             */

            if (
                typeof vDelayed === "string" &&
                vHighRisk === undefined
            ) {

                switch (
                    vDelayed.toUpperCase()
                ) {

                    case "HIGH":
                        return "Error";

                    case "MEDIUM":
                        return "Warning";

                    case "LOW":
                        return "Success";

                    default:
                        return "None";
                }
            }


            var delayed =
                Number(vDelayed) || 0;

            var highRisk =
                Number(vHighRisk) || 0;


            if (
                delayed >= 3 ||
                highRisk >= 3 ||
                (
                    delayed >= 2 &&
                    highRisk >= 2
                )
            ) {

                return "Error";
            }


            if (
                delayed > 0 ||
                highRisk > 0
            ) {

                return "Warning";
            }


            return "Success";
        },


        /* =========================================================
         * STATUS STATE
         * ========================================================= */

        statusState: function (sStatus) {

            if (!sStatus) {
                return "None";
            }

            switch (
                String(sStatus).toUpperCase()
            ) {

                case "APPROVED":
                    return "Success";

                case "PENDING":
                    return "Warning";

                case "REJECTED":
                    return "Error";

                case "CREATED":
                    return "Information";

                default:
                    return "None";
            }
        },


        /* =========================================================
         * PRIORITY STATE
         * ========================================================= */

        priorityState: function (sPriority) {

            if (!sPriority) {
                return "None";
            }

            switch (
                String(sPriority).toUpperCase()
            ) {

                case "CRITICAL":
                    return "Error";

                case "HIGH":
                    return "Warning";

                case "MEDIUM":
                    return "Information";

                case "LOW":
                    return "Success";

                default:
                    return "None";
            }
        },


        /* =========================================================
         * FORMAT PERCENTAGE
         * ========================================================= */

        formatPercentage: function (
            vPercentage
        ) {

            if (
                vPercentage === null ||
                vPercentage === undefined ||
                vPercentage === ""
            ) {
                return "0%";
            }

            var percentage =
                Number(vPercentage);

            if (isNaN(percentage)) {
                return "0%";
            }

            return percentage.toFixed(2) + "%";
        },


        /* =========================================================
         * FORMAT CURRENCY
         * ========================================================= */

        formatCurrency: function (
            vAmount
        ) {

            if (
                vAmount === null ||
                vAmount === undefined ||
                vAmount === ""
            ) {
                return "0.00";
            }

            var amount =
                Number(vAmount);

            if (isNaN(amount)) {
                return "0.00";
            }

            return amount.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
        },


        /* =========================================================
         * FORMAT NUMBER
         * ========================================================= */

        formatNumber: function (
            vNumber
        ) {

            if (
                vNumber === null ||
                vNumber === undefined ||
                vNumber === ""
            ) {
                return "0";
            }

            var number =
                Number(vNumber);

            if (isNaN(number)) {
                return "0";
            }

            return number.toLocaleString(
                "en-IN"
            );
        },


        /* =========================================================
         * FORMAT DATE
         * ========================================================= */

        formatDate: function (
            vDate
        ) {

            if (!vDate) {
                return "-";
            }

            var date =
                new Date(vDate);

            if (isNaN(date.getTime())) {
                return "-";
            }

            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );
        },


        /* =========================================================
         * FORMAT DAYS
         * ========================================================= */

        formatDays: function (
            vDays
        ) {

            var days =
                Number(vDays);

            if (isNaN(days)) {
                return "0 Days";
            }

            return days + " Days";
        },


        /* =========================================================
         * RISK DESCRIPTION
         * ========================================================= */

        riskDescription: function (
            sRisk
        ) {

            if (!sRisk) {
                return "";
            }

            switch (
                String(sRisk).toUpperCase()
            ) {

                case "HIGH":
                    return "Likely SLA Breach";

                case "MEDIUM":
                    return "At Risk";

                case "LOW":
                    return "Within SLA";

                default:
                    return "";
            }
        },


        /* =========================================================
         * SLA TEXT
         * ========================================================= */

        slaText: function (
            sStatus
        ) {

            if (!sStatus) {
                return "-";
            }

            switch (
                String(sStatus).toUpperCase()
            ) {

                case "WITHIN_SLA":
                    return "Within SLA";

                case "AT_RISK":
                    return "At Risk";

                case "BREACHED":
                    return "Breached";

                default:
                    return sStatus;
            }
        },


        /* =========================================================
         * BOOLEAN VISIBILITY
         * ========================================================= */

        isHighRisk: function (
            sRisk
        ) {

            return (
                String(sRisk || "")
                    .toUpperCase() === "HIGH"
            );
        },


        isDelayed: function (
            vDelay
        ) {

            return (
                Number(vDelay || 0) > 0
            );
        },


        /* =========================================================
         * APPROVED ACTION VISIBILITY
         * ========================================================= */

        isApproved: function (
            sStatus
        ) {

            return (
                String(sStatus || "")
                    .toUpperCase() === "APPROVED"
            );
        },


        /* =========================================================
         * PENDING ACTION VISIBILITY
         * ========================================================= */

        isPending: function (
            sStatus
        ) {

            return (
                String(sStatus || "")
                    .toUpperCase() === "PENDING"
            );
        }

    };
});