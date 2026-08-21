sap.ui.define([], function () {
    "use strict";

    return {

        agingState: function (sValue) {

            switch (sValue) {

                case "NORMAL":
                    return "Success";

                case "WARNING":
                    return "Warning";

                case "HIGH":
                    return "Warning";

                case "CRITICAL":
                    return "Error";

                default:
                    return "None";
            }
        },


        slaState: function (sValue) {

            switch (sValue) {

                case "WITHIN_SLA":
                    return "Success";

                case "AT_RISK":
                    return "Warning";

                case "BREACHED":
                    return "Error";

                default:
                    return "None";
            }
        },


        riskState: function (sValue) {

            switch (sValue) {

                case "LOW":
                    return "Success";

                case "MEDIUM":
                    return "Warning";

                case "HIGH":
                    return "Error";

                default:
                    return "None";
            }
        },


        delayState: function (sValue) {

            switch (sValue) {

                case "DELAYED":
                    return "Warning";

                case "HIGH_DELAY":
                    return "Error";

                case "SEVERELY_DELAYED":
                    return "Error";

                default:
                    return "None";
            }
        },


        bottleneckState: function (sValue) {

            switch (sValue) {

                case "LOW":
                    return "Success";

                case "MEDIUM":
                    return "Warning";

                case "HIGH":
                    return "Error";

                case "CRITICAL":
                    return "Error";

                default:
                    return "None";
            }
        },


        /**
         * AI PREDICTION FORMATTERS
         */

        predictionState: function (sValue) {

            switch (sValue) {

                case "SAFE":
                    return "Success";

                case "WATCH":
                    return "Information";

                case "AT RISK":
                    return "Warning";

                case "LIKELY TO BREACH":
                    return "Error";

                default:
                    return "None";
            }
        },


        aiRiskState: function (iRiskPercentage) {

            if (!iRiskPercentage) {
                return "None";
            }

            if (iRiskPercentage >= 90) {
                return "Error";
            } else if (iRiskPercentage >= 70) {
                return "Warning";
            } else if (iRiskPercentage >= 40) {
                return "Information";
            } else {
                return "Success";
            }
        },


        recommendationState: function (sRecommendation) {

            if (!sRecommendation) {
                return "None";
            }

            if (sRecommendation.includes("Immediate Escalation")) {
                return "Error";
            } else if (sRecommendation.includes("Prioritize")) {
                return "Warning";
            } else if (sRecommendation.includes("Monitor Closely")) {
                return "Information";
            } else {
                return "Success";
            }
        },


        formatRiskPercentage: function (iRiskPercentage) {

            if (!iRiskPercentage && iRiskPercentage !== 0) {
                return "N/A";
            }

            return iRiskPercentage + "%";
        },


        /**
         * Calculate AI prediction text from age and SLA
         */
        calculatePrediction: function (ageDays, slaDays) {

            if (!ageDays || !slaDays) {
                return "SAFE";
            }

            var ratio = ageDays / slaDays;

            if (ratio >= 1.5) {
                return "LIKELY TO BREACH";
            } else if (ratio >= 1) {
                return "AT RISK";
            } else if (ratio >= 0.7) {
                return "WATCH";
            } else {
                return "SAFE";
            }
        },


        /**
         * Calculate risk percentage from age and SLA
         */
        calculateRiskPercentage: function (ageDays, slaDays) {

            if (!ageDays || !slaDays) {
                return 0;
            }

            var ratio = ageDays / slaDays;

            if (ratio >= 1.5) {
                return 95;
            } else if (ratio >= 1) {
                return 75;
            } else if (ratio >= 0.7) {
                return 50;
            } else {
                return 15;
            }
        },


        /**
         * Calculate risk state from age and SLA
         */
        calculateRiskState: function (ageDays, slaDays) {

            if (!ageDays || !slaDays) {
                return "None";
            }

            var ratio = ageDays / slaDays;

            if (ratio >= 1.5) {
                return "Error";
            } else if (ratio >= 1) {
                return "Warning";
            } else if (ratio >= 0.7) {
                return "Information";
            } else {
                return "Success";
            }
        },


        /**
         * Calculate recommendation from age and SLA
         */
        calculateRecommendation: function (ageDays, slaDays) {

            if (!ageDays || !slaDays) {
                return "Normal Processing";
            }

            var ratio = ageDays / slaDays;

            if (ratio >= 1.5) {
                return "Immediate Escalation Required";
            } else if (ratio >= 1) {
                return "Prioritize Approval";
            } else if (ratio >= 0.7) {
                return "Monitor Closely";
            } else {
                return "Normal Processing";
            }
        }

    };
});
