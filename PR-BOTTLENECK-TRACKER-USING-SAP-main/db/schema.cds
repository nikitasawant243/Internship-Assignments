namespace pr.bottleneck;

using { managed } from '@sap/cds/common';

entity Departments {
    key departmentCode : String(10);
        departmentName : String(100);
        slaDays         : Integer;
}

entity PurchaseRequisitions {
    key PRNumber : String(10);
    key PRItem   : String(5);

    createdBy        : String(100);
    createdDate      : Date;
    departmentCode   : String(20);
    description      : String(255);
    material         : String(40);
    plant            : String(10);
    purchasingGroup  : String(20);
    quantity         : Integer;
    unit             : String(10);

    status           : String(30);
    approvalStatus   : String(30);
    approvalDate     : Date;

    slaDays          : Integer;

    Approval_Cycle_Days      : Integer;
    PR_Age_Days              : Integer;
    Risk_Level               : String(20);
    SLA_Breach_Probability   : Decimal(5,2);
    SLA_Status               : String(30);
}

entity PurchaseOrders : managed {

    key PONumber : String(10);

    PRNumber     : String(10);
    vendor       : String(100);
    companyCode  : String(10);
    purchasingOrganization : String(10);
    purchasingGroup        : String(10);

    poDate       : Date;
}

entity PurchaseOrderItems : managed {

    key PONumber : String(10);
    key POItem   : String(5);

    PRNumber     : String(10);
    PRItem       : String(5);

    material     : String(40);
    description  : String(200);
    quantity     : Decimal(13,3);
    plant        : String(10);
}