sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"prtracker/test/integration/pages/PurchaseRequisitionsList.gen",
	"prtracker/test/integration/pages/PurchaseRequisitionsObjectPage.gen"
], function (JourneyRunner, PurchaseRequisitionsListGenerated, PurchaseRequisitionsObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('prtracker') + '/test/flp.html#app-preview',
        pages: {
			onThePurchaseRequisitionsListGenerated: PurchaseRequisitionsListGenerated,
			onThePurchaseRequisitionsObjectPageGenerated: PurchaseRequisitionsObjectPageGenerated
        },
        async: true
    });

    return runner;
});

