using { pr.tracker as db } from '../db/schema';


/**
 * ============================================================
 * PROCUREMENT SERVICE
 * ============================================================
 *
 * OData V4 service for PR Bottleneck Tracker
 *
 * Endpoint:
 * /odata/v4/procurement/
 *
 */

@path: '/odata/v4/procurement'
service ProcurementService {


    /**
     * ========================================================
     * PURCHASE REQUISITION
     * ========================================================
     *
     * SAP Concept: EBAN
     *
     * Used for:
     * - PR Aging
     * - Approval Cycle
     * - Delayed Approvals
     * - AI SLA Prediction
     * - Approve
     * - Reject
     * - Mark Urgent
     * - Create Purchase Order
     */

    entity PurchaseRequisition
        as projection on db.PurchaseRequisitions
    actions {

        /**
         * Approve PR
         */
        action approve()
            returns PurchaseRequisition;


        /**
         * Reject PR
         */
        action reject(
            reason : String
        )
        returns PurchaseRequisition;


        /**
         * Create Purchase Order
         */
        action createPurchaseOrder(
            vendor      : String,
            totalAmount : Decimal(15,2)
        )
        returns PurchaseRequisition;


        /**
         * Mark PR as Urgent
         */
        action markAsUrgent()
            returns PurchaseRequisition;

    };


    /**
     * ========================================================
     * PURCHASE ORDER
     * ========================================================
     *
     * SAP Concept: EKKO
     */

    entity PurchaseOrder
        as projection on db.PurchaseOrders;


    /**
     * ========================================================
     * PURCHASE ORDER ITEM
     * ========================================================
     *
     * SAP Concept: EKPO
     */

    entity PurchaseOrderItem
        as projection on db.PurchaseOrderItems;


    /**
     * ========================================================
     * DEPARTMENT
     * ========================================================
     */

    @readonly
    entity Department
        as projection on db.Departments;


    /**
     * ========================================================
     * DEPARTMENT ANALYTICS
     * ========================================================
     *
     * Used by:
     * - Department Bottlenecks
     * - Department KPIs
     * - Delayed PR analysis
     *
     * NOTE:
     * DelayDays and RiskLevel are calculated dynamically
     * in service.js, therefore analytics is exposed as a
     * service entity rather than a direct SQL aggregation.
     */

    @readonly
    entity DepartmentAnalytics {

        key Department : String(100);

        TotalPRs     : Integer;
        PendingPRs   : Integer;
        ApprovedPRs  : Integer;
        RejectedPRs  : Integer;

        DelayedPRs   : Integer;
        HighRiskPRs  : Integer;

        TotalCost    : Decimal(15,2);

        BottleneckLevel : String(20);

    };


    /**
     * ========================================================
     * VENDOR ANALYTICS
     * ========================================================
     */

    @readonly
    entity VendorAnalytics {

        key Vendor : String(100);

        TotalPRs    : Integer;
        TotalValue  : Decimal(15,2);
        ApprovedPRs : Integer;

    };


    /**
     * ========================================================
     * STATUS ANALYTICS
     * ========================================================
     */

    @readonly
    entity StatusAnalytics {

        key Status : String(20);

        Count      : Integer;
        TotalValue : Decimal(15,2);

    };


    /**
     * ========================================================
     * DASHBOARD FUNCTIONS
     * ========================================================
     */

    /**
     * Refresh dashboard
     */
    function refreshDashboard()
        returns String;


    /**
     * Get dashboard KPI summary
     */
    function getKPISummary()
        returns {

            TotalPRs            : Integer;

            PendingPRs          : Integer;

            ApprovedPRs         : Integer;

            RejectedPRs         : Integer;

            DelayedPRs          : Integer;

            HighRiskPRs         : Integer;

            AverageApprovalTime : Decimal(10,2);

            AveragePRAging      : Decimal(10,2);

        };


    /**
     * ========================================================
     * AI-POWERED SLA PREDICTION
     * ========================================================
     *
     * Transparent rule-based prediction.
     * No external AI API required.
     */

    function getMLPredictions()
        returns array of {

            PRNumber     : String;

            riskScore    : Integer;

            riskCategory : String;

            riskLevel    : String;

            method       : String;

        };


    /**
     * Get high-risk PRs
     */
    function getHighRiskPRs(
        threshold : Integer
    )
    returns array of {

        PRNumber     : String;

        riskScore    : Integer;

        riskCategory : String;

        riskLevel    : String;

        method       : String;

    };

}


/**
 * ============================================================
 * PURCHASE REQUISITION CAPABILITIES
 * ============================================================
 */

annotate ProcurementService.PurchaseRequisition with @(
    Capabilities : {

        InsertRestrictions : {
            Insertable : true
        },

        UpdateRestrictions : {
            Updatable : true
        },

        DeleteRestrictions : {
            Deletable : true
        },

        SearchRestrictions : {
            Searchable : true
        },

        FilterRestrictions : {
            Filterable : true
        },

        SortRestrictions : {
            Sortable : true
        }

    }
);


/**
 * ============================================================
 * PURCHASE ORDER CAPABILITIES
 * ============================================================
 */

annotate ProcurementService.PurchaseOrder with @(
    Capabilities : {

        InsertRestrictions : {
            Insertable : true
        },

        UpdateRestrictions : {
            Updatable : true
        },

        DeleteRestrictions : {
            Deletable : true
        },

        SearchRestrictions : {
            Searchable : true
        },

        FilterRestrictions : {
            Filterable : true
        },

        SortRestrictions : {
            Sortable : true
        }

    }
);


/**
 * ============================================================
 * PURCHASE ORDER ITEM CAPABILITIES
 * ============================================================
 */

annotate ProcurementService.PurchaseOrderItem with @(
    Capabilities : {

        InsertRestrictions : {
            Insertable : true
        },

        UpdateRestrictions : {
            Updatable : true
        },

        DeleteRestrictions : {
            Deletable : true
        }

    }
);


/**
 * ============================================================
 * DEPARTMENT CAPABILITIES
 * ============================================================
 */

annotate ProcurementService.Department with @(
    Capabilities : {

        InsertRestrictions : {
            Insertable : true
        },

        UpdateRestrictions : {
            Updatable : true
        },

        DeleteRestrictions : {
            Deletable : true
        },

        SearchRestrictions : {
            Searchable : true
        },

        FilterRestrictions : {
            Filterable : true
        },

        SortRestrictions : {
            Sortable : true
        }

    }
);