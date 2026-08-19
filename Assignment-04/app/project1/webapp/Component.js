sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
    "use strict";

    return UIComponent.extend(
        "pr.tracker.project1.Component",
        {

            metadata: {
                manifest: "json"
            },

            init: function () {

                // Call parent initialization
                UIComponent.prototype.init.apply(this, arguments);

                // Start routing
                this.getRouter().initialize();
            }
        }
    );
});