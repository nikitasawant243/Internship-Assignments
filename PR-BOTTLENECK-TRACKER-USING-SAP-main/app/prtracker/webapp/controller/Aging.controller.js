sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    formatter,
    Filter,
    FilterOperator,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "prtracker.controller.Aging",
        {

            formatter: formatter,

            onInit: function () {
                // Initialize AI predictions model
                var oAIModel = new JSONModel({
                    predictions: []
                });
                this.getView().setModel(oAIModel, "ai");

                // Load data and calculate predictions
                this._loadDataWithPredictions();
            },


            _loadDataWithPredictions: function () {
                var oTable = this.byId("agingTable");
                var oBinding = oTable.getBinding("items");

                if (oBinding) {
                    oBinding.attachDataReceived(function (oEvent) {
                        var aData = oEvent.getParameter("data");
                        if (aData && aData.value) {
                            this._calculateAIPredictions(aData.value);
                        }
                    }.bind(this));
                }
            },


            _calculateAIPredictions: function (aData) {
                var aPredictions = [];

                aData.forEach(function (oItem) {
                    var prediction = this._predictSLABreach(
                        oItem.ageDays,
                        oItem.slaDays
                    );
                    
                    aPredictions.push({
                        PRNumber: oItem.PRNumber,
                        PRItem: oItem.PRItem,
                        prediction: prediction.status,
                        riskPercentage: prediction.riskPercentage,
                        recommendation: prediction.recommendation
                    });
                }.bind(this));

                var oAIModel = this.getView().getModel("ai");
                oAIModel.setProperty("/predictions", aPredictions);
            },


            /**
             * RULE-BASED AI PREDICTION LOGIC
             * Predicts SLA breach based on age/SLA ratio
             */
            _predictSLABreach: function (ageDays, slaDays) {
                if (!ageDays || !slaDays) {
                    return {
                        status: "SAFE",
                        riskPercentage: 0,
                        recommendation: "Normal Processing"
                    };
                }

                var ratio = ageDays / slaDays;

                // LIKELY TO BREACH: ratio >= 1.5
                if (ratio >= 1.5) {
                    return {
                        status: "LIKELY TO BREACH",
                        riskPercentage: 95,
                        recommendation: "Immediate Escalation Required"
                    };
                }

                // AT RISK: ratio >= 1
                if (ratio >= 1) {
                    return {
                        status: "AT RISK",
                        riskPercentage: 75,
                        recommendation: "Prioritize Approval"
                    };
                }

                // WATCH: ratio >= 0.7
                if (ratio >= 0.7) {
                    return {
                        status: "WATCH",
                        riskPercentage: 50,
                        recommendation: "Monitor Closely"
                    };
                }

                // SAFE: ratio < 0.7
                return {
                    status: "SAFE",
                    riskPercentage: 15,
                    recommendation: "Normal Processing"
                };
            },


            /**
             * Get AI prediction for a specific PR
             */
            _getAIPrediction: function (sPRNumber, sPRItem) {
                var oAIModel = this.getView().getModel("ai");
                var aPredictions = oAIModel.getProperty("/predictions");

                var oPrediction = aPredictions.find(function (p) {
                    return p.PRNumber === sPRNumber && p.PRItem === sPRItem;
                });

                return oPrediction || {
                    prediction: "SAFE",
                    riskPercentage: 0,
                    recommendation: "Normal Processing"
                };
            },


            onRefresh: function () {

                var oTable =
                    this.byId("agingTable");

                var oBinding =
                    oTable.getBinding("items");

                if (oBinding) {
                    oBinding.refresh();
                }

                // Recalculate predictions after refresh
                setTimeout(function () {
                    this._loadDataWithPredictions();
                }.bind(this), 500);
            },


            onSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue");

                var oTable =
                    this.byId("agingTable");

                var oBinding =
                    oTable.getBinding("items");


                if (!sValue) {

                    oBinding.filter([]);

                    return;
                }


                var oFilter =
                    new Filter({
                        filters: [

                            new Filter(
                                "PRNumber",
                                FilterOperator.Contains,
                                sValue
                            ),

                            new Filter(
                                "departmentName",
                                FilterOperator.Contains,
                                sValue
                            ),

                            new Filter(
                                "agingCategory",
                                FilterOperator.Contains,
                                sValue
                            )
                        ],

                        and: false
                    });


                oBinding.filter(oFilter);
            }

        }
    );
});

// Made with Bob
