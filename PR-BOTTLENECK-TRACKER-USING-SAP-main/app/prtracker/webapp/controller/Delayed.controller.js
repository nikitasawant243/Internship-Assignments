sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    formatter,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend(
        "prtracker.controller.Delayed",
        {

            formatter: formatter,

            onRefresh: function () {

                var oTable =
                    this.byId("delayedTable");

                var oBinding =
                    oTable.getBinding("items");

                if (oBinding) {
                    oBinding.refresh();
                }
            },


            onSearch: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue");

                var oBinding =
                    this.byId("delayedTable")
                        .getBinding("items");


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
                                "delayStatus",
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