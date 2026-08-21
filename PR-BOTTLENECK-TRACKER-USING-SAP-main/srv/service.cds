using { pr.bottleneck as db } from '../db/schema';

@path: 'pr-tracker'
@title: 'Purchase Requisition Bottleneck Tracker'

service PRTrackerService {

    /*
     * ---------------------------------------------------------
     * PURCHASE REQUISITIONS
     * ---------------------------------------------------------
     */

    entity PurchaseRequisitions
        as projection on db.PurchaseRequisitions;


    /*
     * ---------------------------------------------------------
     * DEPARTMENTS
     * ---------------------------------------------------------
     */

    entity Departments
        as projection on db.Departments;


    /*
     * ---------------------------------------------------------
     * PURCHASE ORDERS
     * ---------------------------------------------------------
     */

    entity PurchaseOrders
        as projection on db.PurchaseOrders;


    /*
     * ---------------------------------------------------------
     * PURCHASE ORDER ITEMS
     * ---------------------------------------------------------
     */

    entity PurchaseOrderItems
        as projection on db.PurchaseOrderItems;


    /*
     * =========================================================
     * PR AGING REPORT
     * =========================================================
     */

    entity PRAgingReport {

        key PRNumber :
            String(10);

        key PRItem :
            String(5);

        createdBy :
            String(100);

        createdDate :
            Date;

        departmentCode :
            String(20);

        departmentName :
            String(100);

        description :
            String(255);

        status :
            String(30);

        approvalDate :
            Date;

        slaDays :
            Integer;

        ageDays :
            Integer;

        agingCategory :
            String(30);

        slaStatus :
            String(30);

        riskLevel :
            String(20);
    }


    /*
     * =========================================================
     * DELAYED APPROVALS
     * =========================================================
     */

    entity DelayedApprovals {

        key PRNumber :
            String(10);

        key PRItem :
            String(5);

        createdBy :
            String(100);

        createdDate :
            Date;

        approvalDate :
            Date;

        departmentCode :
            String(20);

        departmentName :
            String(100);

        status :
            String(30);

        slaDays :
            Integer;

        approvalCycleDays :
            Integer;

        delayDays :
            Integer;

        delayPercentage :
            Decimal(9,2);

        delayStatus :
            String(30);
    }


    /*
     * =========================================================
     * DEPARTMENT BOTTLENECKS
     * =========================================================
     */

    entity DepartmentBottlenecks {

        key departmentCode :
            String(20);

        departmentName :
            String(100);

        totalPRs :
            Integer;

        pendingPRs :
            Integer;

        approvedPRs :
            Integer;

        delayedPRs :
            Integer;

        averageApprovalDays :
            Decimal(9,2);

        bottleneckPercentage :
            Decimal(9,2);

        bottleneckLevel :
            String(20);
    }


    /*
     * =========================================================
     * DASHBOARD KPI FUNCTION
     * =========================================================
     */

    function getDashboardKPIs()
    returns {

        totalPRs :
            Integer;

        pendingPRs :
            Integer;

        agingPRs :
            Integer;

        delayedPRs :
            Integer;

        approvedPRs :
            Integer;

        highRiskPRs :
            Integer;

        bottleneckDepartments :
            Integer;

        averageApprovalDays :
            Decimal(9,2);
    };
}