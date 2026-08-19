sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"pr/tracker/project1/test/integration/pages/PurchaseRequisitionList.gen",
	"pr/tracker/project1/test/integration/pages/PurchaseRequisitionObjectPage.gen"
], function (JourneyRunner, PurchaseRequisitionListGenerated, PurchaseRequisitionObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('pr/tracker/project1') + '/test/flp.html#app-preview',
        pages: {
			onThePurchaseRequisitionListGenerated: PurchaseRequisitionListGenerated,
			onThePurchaseRequisitionObjectPageGenerated: PurchaseRequisitionObjectPageGenerated
        },
        async: true
    });

    return runner;
});

