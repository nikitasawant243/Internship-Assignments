sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"costcenter/project1/test/integration/pages/CostCentersList.gen",
	"costcenter/project1/test/integration/pages/CostCentersObjectPage.gen"
], function (JourneyRunner, CostCentersListGenerated, CostCentersObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('costcenter/project1') + '/test/flp.html#app-preview',
        pages: {
			onTheCostCentersListGenerated: CostCentersListGenerated,
			onTheCostCentersObjectPageGenerated: CostCentersObjectPageGenerated
        },
        async: true
    });

    return runner;
});

