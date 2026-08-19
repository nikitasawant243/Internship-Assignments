sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    JSONModel
) {
    "use strict";

    return Controller.extend(
        "pr.tracker.project1.controller.App",
        {

            onInit: function () {

                var oAppModel = new JSONModel({
                    busy: false
                });

                this.getView().setModel(
                    oAppModel,
                    "app"
                );
            }

        }
    );
});