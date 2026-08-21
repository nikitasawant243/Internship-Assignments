sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "vendor/onboarding/model/models"
], function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("vendor.onboarding.Component", {

        metadata: {
            manifest: "json"
        },

        /**
         * Called when the component is initialized.
         * Sets up the device model and initialises the router.
         */
        init: function () {
            // Call parent init — this sets up routing based on manifest.json
            UIComponent.prototype.init.apply(this, arguments);

            // Create device model for responsive behaviour checks
            this.setModel(models.createDeviceModel(), "device");

            // Initialise the router
            this.getRouter().initialize();
        }
    });
});
