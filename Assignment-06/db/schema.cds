namespace assignment06;

entity VendorStaging {

    key ID            : UUID;

    vendorCode        : String(20);
    vendorName        : String(100);
    panNumber         : String(10);
    gstNumber         : String(15);
    country           : String(50);
    bankAccount       : String(30);
    ifsc              : String(20);
    creditLimit       : Decimal(15,2);

    status            : String(20);
    uploadedBy        : String(100);
    uploadedAt        : Timestamp;
}


entity VendorMaster {

    key vendorCode    : String(20);

    vendorName        : String(100);
    panNumber         : String(10);
    gstNumber         : String(15);
    country           : String(50);
    bankAccount       : String(30);
    ifsc              : String(20);
    creditLimit       : Decimal(15,2);

    createdBy         : String(100);
    createdAt         : Timestamp;
}


entity VendorApproval {

    key ID            : UUID;

    vendorCode        : String(20);
    action            : String(20);
    comment           : String(500);

    actionBy          : String(100);
    actionAt          : Timestamp;
}


entity VendorAudit {

    key ID            : UUID;

    vendorCode        : String(20);

    action            : String(50);
    changedBy         : String(100);
    changedAt         : Timestamp;

    oldValue          : String(500);
    newValue          : String(500);
}


entity Countries {

    key countryCode   : String(10);

    countryName       : String(100);
}

entity BlacklistedVendors {

    key vendorCode : String(20);

    vendorName     : String(100);

    reason         : String(500);

}