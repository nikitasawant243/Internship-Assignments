using { assignment06 as db } from '../db/schema';

service VendorService {

    entity VendorStaging
        as projection on db.VendorStaging;

    entity VendorMaster
        as projection on db.VendorMaster;

    entity VendorApproval
        as projection on db.VendorApproval;

    entity VendorAudit
        as projection on db.VendorAudit;

    entity Countries
        as projection on db.Countries;

    entity BlacklistedVendors
        as projection on db.BlacklistedVendors;


    // ============================================
    // EXCEL UPLOAD
    // ============================================

    action uploadVendors(
        fileName : String,
        fileData : LargeString
    ) returns {
        totalRecords  : Integer;
        successRecords : Integer;
        failedRecords  : Integer;
        message       : String;
    };


    // ============================================
    // APPROVE
    // ============================================

    action approveVendor(
        vendorID : UUID,
        comment  : String
    ) returns String;


    // ============================================
    // REJECT
    // ============================================

    action rejectVendor(
        vendorID : UUID,
        comment  : String
    ) returns String;

}