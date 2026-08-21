sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "prtracker.controller.Home",
        {

            onInit: function () {

                var oDashboardModel = new JSONModel({
                    totalPRs: 0,
                    pendingPRs: 0,
                    agingPRs: 0,
                    delayedPRs: 0,
                    approvedPRs: 0,
                    highRiskPRs: 0,
                    bottleneckDepartments: 0,
                    averageApprovalDays: 0
                });

                this.getView().setModel(
                    oDashboardModel,
                    "dashboard"
                );

                this._loadDashboardKPIs();
            },


            _loadDashboardKPIs: function () {

                var oODataModel =
                    this.getOwnerComponent().getModel();

                if (!oODataModel) {

                    console.error(
                        "ERROR: OData V4 model is not available."
                    );

                    return;
                }


                console.log(
                    "OData model found:",
                    oODataModel
                );


                var oOperation =
                    oODataModel.bindContext(
                        "/getDashboardKPIs(...)"
                    );


                oOperation.execute()
                    .then(function () {

                        return oOperation.requestObject();

                    })
                    .then(function (oData) {

                        console.log(
                            "========== DASHBOARD KPI RESPONSE =========="
                        );

                        console.log(
                            oData
                        );


                        if (!oData) {

                            console.error(
                                "KPI function returned no data."
                            );

                            return;
                        }


                        var oDashboardModel =
                            this.getView()
                                .getModel("dashboard");


                        oDashboardModel.setProperty(
                            "/totalPRs",
                            Number(oData.totalPRs || 0)
                        );


                        oDashboardModel.setProperty(
                            "/pendingPRs",
                            Number(oData.pendingPRs || 0)
                        );


                        oDashboardModel.setProperty(
                            "/agingPRs",
                            Number(oData.agingPRs || 0)
                        );


                        oDashboardModel.setProperty(
                            "/delayedPRs",
                            Number(oData.delayedPRs || 0)
                        );


                        oDashboardModel.setProperty(
                            "/approvedPRs",
                            Number(oData.approvedPRs || 0)
                        );


                        oDashboardModel.setProperty(
                            "/highRiskPRs",
                            Number(oData.highRiskPRs || 0)
                        );


                        oDashboardModel.setProperty(
                            "/bottleneckDepartments",
                            Number(
                                oData.bottleneckDepartments || 0
                            )
                        );


                        oDashboardModel.setProperty(
                            "/averageApprovalDays",
                            Number(
                                oData.averageApprovalDays || 0
                            )
                        );


                        console.log(
                            "Dashboard model updated:",
                            oDashboardModel.getData()
                        );


                    }.bind(this))
                    .catch(function (oError) {

                        console.error(
                            "========== KPI ERROR =========="
                        );

                        console.error(
                            oError
                        );

                    });

            },


            onRefresh: function () {

                this._loadDashboardKPIs();

            },


            onAging: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("aging");

            },


            onDelayed: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("delayed");

            },


            onBottleneck: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("bottleneck");

            },


            onSLADashboard: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("slaDashboard");

            }

        }
    );
});