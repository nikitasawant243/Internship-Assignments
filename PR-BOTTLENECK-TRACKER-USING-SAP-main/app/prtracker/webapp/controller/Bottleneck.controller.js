sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"
], function (
    Controller,
    formatter
) {
    "use strict";

    return Controller.extend(
        "prtracker.controller.Bottleneck",
        {

            formatter: formatter,


            onRefresh: function () {

                var oTable =
                    this.byId("bottleneckTable");

                var oBinding =
                    oTable.getBinding("items");

                if (oBinding) {
                    oBinding.refresh();
                }
            }

        }
    );
});