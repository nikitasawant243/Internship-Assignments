"use strict";

/**
 * PR SLA Risk Prediction Service
 *
 * Risk Score:
 *
 * 0 - 39   = Low
 * 40 - 69  = Medium
 * 70 - 100 = High
 */

function calculateRiskLevel(pr) {

    let score = 0;

    const today = new Date();

    let aging = 0;

    if (pr.CreatedDate) {

        const created = new Date(pr.CreatedDate);

        aging = Math.floor(
            (today - created) /
            (1000 * 60 * 60 * 24)
        );
    }


    const sla = Number(pr.SLAInDays || 3);

    const remainingDays = sla - aging;


    // -------------------------------
    // PR Aging
    // -------------------------------

    if (aging >= sla) {

        score += 50;

    } else if (remainingDays <= 1) {

        score += 35;

    } else if (remainingDays <= 2) {

        score += 20;

    } else {

        score += 5;
    }


    // -------------------------------
    // Priority
    // -------------------------------

    if (pr.Priority === "Critical") {

        score += 25;

    } else if (pr.Priority === "High") {

        score += 18;

    } else if (pr.Priority === "Medium") {

        score += 10;

    } else {

        score += 5;
    }


    // -------------------------------
    // Pending Status
    // -------------------------------

    if (pr.Status === "Pending") {

        score += 15;
    }


    // -------------------------------
    // Expected Approval
    // -------------------------------

    if (pr.ExpectedApprovalDate) {

        const expected =
            new Date(pr.ExpectedApprovalDate);

        if (today > expected) {

            score += 20;

        } else {

            const daysRemaining = Math.floor(
                (expected - today) /
                (1000 * 60 * 60 * 24)
            );

            if (daysRemaining <= 1) {

                score += 15;

            } else if (daysRemaining <= 2) {

                score += 8;
            }
        }
    }


    score = Math.min(
        100,
        Math.max(0, score)
    );


    let riskLevel;
    let riskCategory;


    if (score >= 70) {

        riskLevel = "High";
        riskCategory = "Likely SLA Breach";

    } else if (score >= 40) {

        riskLevel = "Medium";
        riskCategory = "At Risk";

    } else {

        riskLevel = "Low";
        riskCategory = "Within SLA";
    }


    return {

        riskLevel,

        riskScore:
            Number(score.toFixed(2)),

        riskCategory
    };
}


async function calculateBatchRiskLevels(prs) {

    return prs.map(pr => {

        const risk =
            calculateRiskLevel(pr);

        return {

            PRNumber : pr.PRNumber,

            RiskLevel :
                risk.riskLevel,

            RiskScore :
                risk.riskScore,

            RiskCategory :
                risk.riskCategory
        };
    });
}


async function getHighRiskPRs(
    prs,
    threshold = 70
) {

    const predictions =
        await calculateBatchRiskLevels(prs);

    return predictions.filter(
        p => p.RiskScore >= threshold
    );
}


async function getAnalyticsSummary(prs) {

    const predictions =
        await calculateBatchRiskLevels(prs);

    return {

        totalCount :
            predictions.length,

        highRiskCount :
            predictions.filter(
                p => p.RiskScore >= 70
            ).length,

        mediumRiskCount :
            predictions.filter(
                p =>
                    p.RiskScore >= 40 &&
                    p.RiskScore < 70
            ).length,

        lowRiskCount :
            predictions.filter(
                p => p.RiskScore < 40
            ).length,

        predictions
    };
}


module.exports = {

    calculateRiskLevel,

    calculateBatchRiskLevels,

    getHighRiskPRs,

    getAnalyticsSummary
};