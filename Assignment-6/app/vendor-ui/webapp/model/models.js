sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Creates a JSONModel pre-populated with SAP UI5 Device API data.
         * Used to adapt layouts for desktop / tablet / phone.
         *
         * @returns {sap.ui.model.json.JSONModel}
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Creates the shared application state model.
         * All views can read/write via the named "state" model.
         *
         * @returns {sap.ui.model.json.JSONModel}
         */
        createStateModel: function () {
            return new JSONModel({
                uploadPreview    : [],
                validationErrors : [],
                uploadResult     : null,
                busy             : false,
                selectedStagingID: null,
                currentUser      : null
            });
        }
    };
});
