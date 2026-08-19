namespace pr.tracker;

using {
    cuid,
    managed
} from '@sap/cds/common';


/**
 * ============================================================
 * DEPARTMENTS
 * ============================================================
 */

entity Departments : cuid, managed {

    departmentCode : String(20) not null;

    departmentName : String(100) not null;

    description : String(255);

    isActive : Boolean default true;
}


/**
 * ============================================================
 * PURCHASE REQUISITIONS
 * SAP CONCEPT: EBAN
 * ============================================================
 */

entity PurchaseRequisitions : cuid, managed {

    @title: 'PR Number'
    PRNumber : String(20) not null;

    @title: 'Item'
    Item : String(20);

    @title: 'Material Description'
    MaterialDescription : String(255);

    @title: 'Department'
    Department : String(100);

    @title: 'Department Code'
    DepartmentCode : String(20);

    @title: 'Created Date'
    CreatedDate : Date;

    @title: 'Approval Date'
    ApprovalDate : Date;

    @title: 'Expected Approval Date'
    ExpectedApprovalDate : Date;

    @title: 'SLA In Days'
    SLAInDays : Integer default 5;

    @title: 'Priority'
    Priority : String(20);

    @title: 'Status'
    Status : String(20);

    @title: 'Estimated Cost'
    EstimatedCost : Decimal(15,2);

    @title: 'Currency'
    Currency : String(5) default 'INR';

    @title: 'Vendor'
    Vendor : String(100);

    @title: 'Purchase Order Number'
    PONumber : String(20);

    /*
     * --------------------------------------------------------
     * Calculated / Analytics Fields
     * --------------------------------------------------------
     */

    @title: 'PR Aging'
    PRAging : Integer;

    @title: 'SLA Status'
    SLAStatus : String(20);

    @title: 'Approval Cycle Time'
    ApprovalCycleTime : Integer;

    @title: 'Delay Days'
    DelayDays : Integer;

    @title: 'Delay Percentage'
    DelayPercentage : Decimal(10,2);

    @title: 'Risk Score'
    RiskScore : Integer;

    @title: 'Risk Level'
    RiskLevel : String(20);

    @title: 'Risk Category'
    RiskCategory : String(50);
}


/**
 * ============================================================
 * PURCHASE ORDERS
 * SAP CONCEPT: EKKO
 * ============================================================
 */

entity PurchaseOrders : cuid, managed {

    @title: 'PO Number'
    PONumber : String(20) not null;

    @title: 'PR Number'
    PRNumber : String(20);

    @title: 'Vendor'
    Vendor : String(100);

    @title: 'Created Date'
    CreatedDate : Date;

    @title: 'Total Amount'
    TotalAmount : Decimal(15,2);

    @title: 'Currency'
    Currency : String(5) default 'INR';

    @title: 'Status'
    Status : String(20);

    @title: 'Company Code'
    CompanyCode : String(10);

    @title: 'Purchasing Organization'
    PurchasingOrganization : String(20);

    @title: 'Purchasing Group'
    PurchasingGroup : String(20);
}


/**
 * ============================================================
 * PURCHASE ORDER ITEMS
 * SAP CONCEPT: EKPO
 * ============================================================
 */

entity PurchaseOrderItems : cuid, managed {

    @title: 'PO Number'
    PONumber : String(20) not null;

    @title: 'Item Number'
    ItemNumber : String(10);

    @title: 'PR Number'
    PRNumber : String(20);

    @title: 'Material'
    Material : String(40);

    @title: 'Material Description'
    MaterialDescription : String(255);

    @title: 'Quantity'
    Quantity : Decimal(13,3);

    @title: 'Unit'
    Unit : String(10);

    @title: 'Unit Price'
    UnitPrice : Decimal(15,2);

    @title: 'Net Value'
    NetValue : Decimal(15,2);

    @title: 'Currency'
    Currency : String(5) default 'INR';
}